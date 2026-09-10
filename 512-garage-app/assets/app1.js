
const KEY="garage512_offline_v1", SKEY="garage512_session";
const seed=()=>({schemaVersion:"1.1",users:[{username:"admin",password:"admin512",name:"Owner",role:"Owner",active:true},{username:"staff",password:"staff512",name:"Front Desk",role:"Staff",active:true}],departments:[{department_id:"DEP-001",name:"Mechanical / PMS"},{department_id:"DEP-002",name:"Painting"},{department_id:"DEP-003",name:"Detailing"},{department_id:"DEP-004",name:"Undercoating"},{department_id:"DEP-005",name:"Tint"},{department_id:"DEP-006",name:"Office / Admin"},{department_id:"DEP-007",name:"Management"}],services:[
{service_id:"SVC-00001",name:"Change Oil",department_id:"DEP-001",price:0,active:true},
{service_id:"SVC-00002",name:"Painting",department_id:"DEP-002",price:0,active:true},
{service_id:"SVC-00003",name:"Ceramic Coating",department_id:"DEP-003",price:0,active:true},
{service_id:"SVC-00004",name:"Undercoating",department_id:"DEP-004",price:0,active:true},
{service_id:"SVC-00005",name:"Tint",department_id:"DEP-005",price:0,active:true},
{service_id:"SVC-00006",name:"Interior Detailing",department_id:"DEP-003",price:0,active:true},
{service_id:"SVC-00007",name:"Exterior Detailing",department_id:"DEP-003",price:0,active:true},
{service_id:"SVC-00008",name:"PMS",department_id:"DEP-001",price:0,active:true},
{service_id:"SVC-00009",name:"Rotor Disc Resurfacing",department_id:"DEP-001",price:0,active:true},
{service_id:"SVC-00010",name:"Other Services",department_id:"DEP-001",price:0,active:true},
{service_id:"SVC-00011",name:"Brake Cleaning",department_id:"DEP-001",price:0,active:true},
{service_id:"SVC-00012",name:"B2B Painting",department_id:"DEP-002",price:0,active:true},
{service_id:"SVC-00013",name:"Coolant",department_id:"DEP-001",price:0,active:true},
{service_id:"SVC-00014",name:"Underchassis Repair",department_id:"DEP-001",price:0,active:true},
{service_id:"SVC-00015",name:"Electrical Wiring",department_id:"DEP-001",price:0,active:true},
{service_id:"SVC-00016",name:"Change Gear Oil / ATF",department_id:"DEP-001",price:0,active:true},
{service_id:"SVC-00017",name:"Aircon Cleaning",department_id:"DEP-001",price:0,active:true},
{service_id:"SVC-00018",name:"Spark Plug Cleaning",department_id:"DEP-001",price:0,active:true}
],customers:[],vehicles:[],jobOrders:[],payments:[],jobCosts:[],employees:[],payroll:[],expenses:[],audit:[]});
let db=JSON.parse(localStorage.getItem(KEY)||"null")||seed(), session=JSON.parse(sessionStorage.getItem(SKEY)||"null");
if(!db.uiMigrations)db.uiMigrations={};
if(!db.uiMigrations.serviceCatalogV2){const oldSample=db.services?.find(s=>s.service_id==="SVC-00001"&&s.name==="Change Oil"&&Number(s.price)===3500);if(oldSample)oldSample.price=0;(db.services||[]).forEach(s=>{if(typeof s.active==="undefined")s.active=true});db.uiMigrations.serviceCatalogV2=true;}
if(!db.uiMigrations.financeMasterV23){
  db.departments=db.departments||[];
  const deptById=id=>db.departments.find(d=>d.department_id===id);
  if(deptById("DEP-001"))deptById("DEP-001").name="Mechanical / PMS";
  if(deptById("DEP-002"))deptById("DEP-002").name="Painting";
  if(deptById("DEP-003"))deptById("DEP-003").name="Detailing";
  if(deptById("DEP-004"))deptById("DEP-004").name="Undercoating";
  if(deptById("DEP-005"))deptById("DEP-005").name="Tint";
  if(!deptById("DEP-006"))db.departments.push({department_id:"DEP-006",name:"Office / Admin"});
  if(!deptById("DEP-007"))db.departments.push({department_id:"DEP-007",name:"Management"});
  db.services=db.services||[];
  const oldPaint=db.services.find(s=>s.service_id==="SVC-00002"&&s.name==="Express Repaint"); if(oldPaint){oldPaint.name="Painting";oldPaint.department_id="DEP-002";}
  const oldTint=db.services.find(s=>s.service_id==="SVC-00005"&&s.name==="Window Tint"); if(oldTint){oldTint.name="Tint";oldTint.department_id="DEP-005";}
  const masters=[
    ["Change Oil","DEP-001"],["Interior Detailing","DEP-003"],["Exterior Detailing","DEP-003"],["Ceramic Coating","DEP-003"],["Tint","DEP-005"],["PMS","DEP-001"],
    ["Rotor Disc Resurfacing","DEP-001"],["Other Services","DEP-001"],["Painting","DEP-002"],["Brake Cleaning","DEP-001"],["B2B Painting","DEP-002"],["Coolant","DEP-001"],
    ["Underchassis Repair","DEP-001"],["Electrical Wiring","DEP-001"],["Change Gear Oil / ATF","DEP-001"],["Aircon Cleaning","DEP-001"],["Spark Plug Cleaning","DEP-001"],["Undercoating","DEP-004"]
  ];
  masters.forEach(([name,department_id])=>{let s=db.services.find(x=>String(x.name).toLowerCase()===name.toLowerCase());if(!s){s={service_id:next("SVC",db.services,"service_id"),name,department_id,price:0,active:true};db.services.push(s)}else if(!s.department_id)s.department_id=department_id;if(typeof s.active==="undefined")s.active=true;});
  db.uiMigrations.financeMasterV23=true;
  db.schemaVersion="1.1";
  localStorage.setItem(KEY,JSON.stringify(db));
}
const save=()=>localStorage.setItem(KEY,JSON.stringify(db)), $=id=>document.getElementById(id), esc=v=>String(v??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m])), money=v=>new Intl.NumberFormat("en-PH",{style:"currency",currency:"PHP"}).format(Number(v||0));
function next(prefix,arr,key){let m=0;arr.forEach(x=>{let z=String(x[key]||"").match(/(\d+)$/);if(z)m=Math.max(m,+z[1])});return prefix+"-"+String(m+1).padStart(5,"0")}
function audit(action,id=""){db.audit.push({at:new Date().toISOString(),user:session?.username||"system",action,id});save()}
function login(){let u=$("lu").value.trim(),p=$("lp").value,f=db.users.find(x=>x.username===u&&x.password===p&&x.active);if(!f)return alert("Invalid username or password.");session={username:f.username,name:f.name,role:f.role};sessionStorage.setItem(SKEY,JSON.stringify(session));audit("LOGIN");boot()}
$("loginBtn").onclick=login;$("lp").onkeydown=e=>{if(e.key==="Enter")login()};$("logoutBtn").onclick=()=>{audit("LOGOUT");sessionStorage.removeItem(SKEY);location.reload()};
function boot(){$("login").classList.add("hidden");$("app").classList.remove("hidden");$("userpill").textContent=session.role+" • "+session.name;document.querySelectorAll(".owner").forEach(x=>x.classList.toggle("hidden",session.role!=="Owner"));render();view("dashboard");if("serviceWorker"in navigator&&location.protocol.startsWith("http"))navigator.serviceWorker.register("sw.js").catch(()=>{})}
document.querySelectorAll(".nav button").forEach(b=>b.onclick=()=>view(b.dataset.v));
function view(v){document.querySelectorAll("[id^='v-']").forEach(x=>x.classList.add("hidden"));$("v-"+v).classList.remove("hidden");document.querySelectorAll(".nav button").forEach(b=>b.classList.toggle("active",b.dataset.v===v));$("title").textContent=({dashboard:"Dashboard",customers:"Customers",vehicles:"Vehicles",jobs:"Job Orders",services:"Services",finance:"Finance Bridge",payroll:"Payroll Setup",users:"Staff Users",backup:"Backup / Restore"})[v]||v}
function render(){$("sCustomers").textContent=db.customers.length;$("sVehicles").textContent=db.vehicles.length;$("sJobs").textContent=db.jobOrders.filter(x=>!["Completed","Released","Cancelled"].includes(x.status)).length;$("sRevenue").textContent=money(db.payments.reduce((a,b)=>a+Number(b.amount||0),0));$("recent").innerHTML=db.customers.slice(-5).reverse().map(c=>`<tr><td>${c.customer_id}</td><td>${esc(c.full_name)}</td><td>${esc(c.mobile)}</td><td>${esc(c.source)}</td></tr>`).join("")||`<tr><td colspan="4">No customers yet.</td></tr>`;renderCustomers();renderVehicles();renderJobs();renderServices();renderUsers()}
function renderCustomers(){let q=($("custSearch")?.value||"").toLowerCase(),rows=db.customers.filter(c=>[c.customer_id,c.full_name,c.mobile,c.company,c.source].join(" ").toLowerCase().includes(q));$("custTable").innerHTML=rows.map(c=>`<tr><td>${c.customer_id}</td><td><b>${esc(c.full_name)}</b>${c.company?`<small>${esc(c.company)}</small>`:""}</td><td>${esc(c.mobile)}</td><td>${esc(c.type)}</td><td>${esc(c.source)}</td><td>${db.vehicles.filter(v=>v.customer_id===c.customer_id).length}</td></tr>`).join("")||`<tr><td colspan="6">No matching customers.</td></tr>`}
function renderVehicles(){let q=($("vehSearch")?.value||"").toLowerCase(),rows=db.vehicles.filter(v=>{let c=db.customers.find(x=>x.customer_id===v.customer_id);return[v.vehicle_id,v.plate,v.make,v.model,c?.full_name].join(" ").toLowerCase().includes(q)});$("vehTable").innerHTML=rows.map(v=>{let c=db.customers.find(x=>x.customer_id===v.customer_id);return`<tr><td>${v.vehicle_id}</td><td><b>${esc(v.plate)}</b></td><td>${esc(v.make)} ${esc(v.model)}</td><td>${esc(v.year||"")}</td><td>${Number(v.mileage||0).toLocaleString()} km</td><td>${esc(c?.full_name||"")}</td></tr>`}).join("")||`<tr><td colspan="6">No matching vehicles.</td></tr>`}
