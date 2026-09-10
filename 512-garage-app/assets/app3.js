function serviceOpts(){return `<option value="">Select service...</option>`+db.services.filter(s=>s.active!==false).map(s=>`<option value="${s.service_id}">${esc(s.name)}</option>`).join("")}
const jobStatuses=["Quoted","Approved","In Progress","Waiting for Parts","Quality Check","Completed","Released","Cancelled"];
function newJob(){
  if(!db.vehicles.length)return alert("Create a customer and vehicle first.");
  modal("New Job Order",`<form id="jf"><div class="formgrid">
  <div><label>Customer *</label><select id="jc" name="customer">${custOpts()}</select></div>
  <div><label>Vehicle *</label><select id="jv" name="vehicle"></select></div>
  <div><label>Date Opened *</label><input type="date" name="date" value="${new Date().toISOString().slice(0,10)}" required></div>
  <div><label>Mileage In</label><input name="mileage" type="number" min="0" placeholder="Current odometer"></div>
  <div><label>Service Advisor</label><input name="advisor" value="${esc(session?.name||"")}" placeholder="Staff handling this job"></div>
  <div><label>Job Status</label><select name="status">${jobStatuses.map(s=>`<option>${s}</option>`).join("")}</select></div>
  <div><label>Visit Type</label><select name="visit_type"><option>New Visit</option><option>Returning Customer</option></select></div>
  <div><label>Rework / Warranty?</label><select name="rework"><option>No</option><option>Yes</option></select></div>
  <div class="fullrow"><label>Customer Concern</label><textarea name="concern" placeholder="What did the customer report? e.g. Brake noise / Aircon not cold"></textarea></div>
  <div class="fullrow"><div class="service-head"><div><label>Services *</label><div class="hint">Put every service for this vehicle visit in this one Job Order. You can mix departments.</div></div><button type="button" class="btn secondary" id="addServiceLine">+ Add Service</button></div><div id="jobServiceLines"></div></div>
  <div><label>Discount (₱)</label><input id="jobDiscount" name="discount" type="number" min="0" step="0.01" value="0"></div>
  <div><label>Completion Date</label><input name="completion_date" type="date"></div>
  <div class="fullrow estimatebox"><div><span>Quoted Amount</span><b id="jobQuoted">₱0.00</b></div><div><span>Discount</span><b id="jobDiscountDisplay">₱0.00</b></div><div><span>Final Sales</span><b id="jobFinal">₱0.00</b></div></div>
  <div class="fullrow"><label>Internal Notes</label><textarea name="notes" placeholder="Optional shop notes"></textarea></div>
  </div><button class="btn primary full">Create Job Order</button></form>`);
  let updateVehicles=()=>{
    $("jv").innerHTML=db.vehicles.filter(v=>v.customer_id===$("jc").value).map(v=>`<option value="${v.vehicle_id}">${esc(v.plate)} — ${esc(v.make)} ${esc(v.model)}</option>`).join("");
    let v=db.vehicles.find(x=>x.vehicle_id===$("jv").value);
    document.querySelector('#jf [name="mileage"]').value=v?.mileage||""
  };
  $("jc").onchange=updateVehicles;
  $("jv").onchange=()=>{let v=db.vehicles.find(x=>x.vehicle_id===$("jv").value);document.querySelector('#jf [name="mileage"]').value=v?.mileage||""};
  updateVehicles();
  let calc=()=>{
    let quoted=0;
    document.querySelectorAll('#jobServiceLines .service-line').forEach(r=>{
      let q=Number(r.querySelector('.js-qty').value||0),p=Number(r.querySelector('.js-price').value||0),t=q*p;
      quoted+=t;r.querySelector('.line-total').textContent=money(t)
    });
    let discount=Math.max(0,Number($("jobDiscount").value||0)),final=Math.max(0,quoted-discount);
    $("jobQuoted").textContent=money(quoted);$("jobDiscountDisplay").textContent=money(discount);$("jobFinal").textContent=money(final);
    return{quoted,discount,final}
  };
  let addLine=(preset={})=>{
    let wrap=$("jobServiceLines"),row=document.createElement("div");row.className="service-line";
    row.innerHTML=`<div><label>Service</label><select class="js-service" required>${serviceOpts()}</select></div><div><label>Department</label><select class="js-dept" required>${deptOpts()}</select></div><div><label>Qty</label><input class="js-qty" type="number" min="1" step="1" value="1" required></div><div><label>Selling Price</label><input class="js-price" type="number" min="0" step="0.01" value="0" required></div><div><label>Line Total</label><div class="line-total">₱0.00</div></div><div class="line-remove"><button type="button" class="btn secondary">Remove</button></div>`;
    wrap.appendChild(row);
    let svc=row.querySelector('.js-service'),dep=row.querySelector('.js-dept'),qty=row.querySelector('.js-qty'),price=row.querySelector('.js-price');
    svc.onchange=()=>{let x=db.services.find(s=>s.service_id===svc.value);if(x){dep.value=x.department_id;price.value=Number(x.price||0);calc()}};
    [qty,price].forEach(x=>x.oninput=calc);
    row.querySelector('.line-remove button').onclick=()=>{row.remove();calc()};
    if(preset.service_id){svc.value=preset.service_id;svc.onchange()}
    calc()
  };
  $("addServiceLine").onclick=()=>addLine();
  $("jobDiscount").oninput=calc;
  addLine();
  $("jf").onsubmit=e=>{
    e.preventDefault();
    let rows=[...document.querySelectorAll('#jobServiceLines .service-line')];
    if(!rows.length)return alert("Add at least one service.");
    let services=rows.map((r,i)=>{
      let sid=r.querySelector('.js-service').value,srv=db.services.find(s=>s.service_id===sid),qty=Number(r.querySelector('.js-qty').value||1),price=Number(r.querySelector('.js-price').value||0);
      return{line_no:i+1,service_id:sid,service_name:srv?.name||"",department_id:r.querySelector('.js-dept').value,quantity:qty,unit_price:price,line_total:qty*price}
    });
    if(services.some(x=>!x.service_id))return alert("Please select a service for every line.");
    let f=new FormData(e.target),totals=calc(),j={
      job_order_id:next("JO",db.jobOrders,"job_order_id"),
      customer_id:f.get("customer"),vehicle_id:f.get("vehicle"),
      date:f.get("date"),date_opened:f.get("date"),completion_date:f.get("completion_date")||"",
      mileage_in:+f.get("mileage")||0,visit_type:f.get("visit_type"),service_advisor:f.get("advisor"),
      status:f.get("status"),rework:f.get("rework"),concern:f.get("concern"),notes:f.get("notes"),
      services,primary_service:services[0]?.service_name||"",
      quoted_amount:totals.quoted,discount:totals.discount,final_sales:totals.final,
      estimate:totals.final,created_at:new Date().toISOString()
    };
    db.jobOrders.push(j);
    let v=db.vehicles.find(x=>x.vehicle_id===j.vehicle_id);if(v&&j.mileage_in)v.mileage=j.mileage_in;
    audit("JOB_CREATED",j.job_order_id);save();closeModal();render();view("jobs")
  }
}
