// 512 Garage Financial System master service catalog sync
// Runs after all application scripts load so the existing local database is actually updated.
window.addEventListener('load',function(){
  if(typeof db==='undefined') return;
  if(!db.uiMigrations) db.uiMigrations={};
  db.services=db.services||[];
  db.departments=db.departments||[];
  const ensureDept=(id,name)=>{let d=db.departments.find(x=>x.department_id===id);if(!d){d={department_id:id,name};db.departments.push(d)}else d.name=name;};
  ensureDept('DEP-001','Mechanical / PMS');
  ensureDept('DEP-002','Painting');
  ensureDept('DEP-003','Detailing');
  ensureDept('DEP-004','Undercoating');
  ensureDept('DEP-005','Tint');
  ensureDept('DEP-006','Office / Admin');
  ensureDept('DEP-007','Management');
  const catalog=[
    ['Aircon Cleaning','DEP-001'],['B2B Painting','DEP-002'],['Brake Cleaning','DEP-001'],['Brake Flushing','DEP-001'],
    ['Ceramic Coating','DEP-003'],['Change Gear Oil / ATF','DEP-001'],['Change Oil','DEP-001'],['Convenience Fee','DEP-006'],
    ['Coolant','DEP-001'],['Coolant Flushing','DEP-001'],['Diesel Decarbon','DEP-001'],['ECU Remap','DEP-001'],['ECU Scanning','DEP-001'],
    ['Electrical Wiring','DEP-001'],['Exterior Detailing','DEP-003'],['Fuel System Decarb','DEP-001'],['Gasoline Decarbon','DEP-001'],
    ['Interior Detailing','DEP-003'],['Mechanical Services Labor','DEP-001'],['Other Services','DEP-001'],['Painting','DEP-002'],
    ['Rotor Disc Resurfacing','DEP-001'],['Spark Plug Cleaning','DEP-001'],['Tint','DEP-005'],['Turbo Cleaning','DEP-001'],
    ['Underchassis Repair','DEP-001'],['Undercoating','DEP-004'],['Washover','DEP-002']
  ];
  const norm=s=>String(s||'').trim().toLowerCase();
  const rename=(from,to,dept)=>{let s=db.services.find(x=>norm(x.name)===norm(from));if(s){s.name=to;s.department_id=dept;s.active=true;}};
  rename('Express Repaint','Painting','DEP-002'); rename('Window Tint','Tint','DEP-005');
  catalog.forEach(([name,department_id])=>{
    let s=db.services.find(x=>norm(x.name)===norm(name));
    if(!s){s={service_id:next('SVC',db.services,'service_id'),name,department_id,price:0,active:true};db.services.push(s);}
    else {s.department_id=department_id;s.active=true;if(typeof s.price==='undefined')s.price=0;}
  });
  db.uiMigrations.financeMasterV26=true; db.schemaVersion='1.3';
  localStorage.setItem(KEY,JSON.stringify(db));
  if(typeof render==='function') render();
});