/* DOM取得 */
const homeSection=document.getElementById("home");
const loginSection=document.getElementById("memberLogin");
const signupSection=document.getElementById("memberSignup");
const boxArea=document.getElementById("boxArea");
const submitArea=document.getElementById("submitArea");
const listArea=document.getElementById("listArea");
const accountArea=document.getElementById("accountArea");
const logoutBtn=document.getElementById("logoutBtn");
const loginInfo=document.getElementById("loginInfo");

const loginNameInput=document.getElementById("loginName");
const loginPassInput=document.getElementById("loginPass");
const signupNameInput=document.getElementById("signupName");
const signupPassInput=document.getElementById("signupPass");
const boxTitleInput=document.getElementById("boxTitle");
const boxDeadlineInput=document.getElementById("boxDeadline");
const boxSelect=document.getElementById("boxSelect");
const boxManage=document.getElementById("boxManage");
const workTitleInput=document.getElementById("workTitle");
const textContentInput=document.getElementById("textContent");
const fileInput=document.getElementById("fileInput");
const list=document.getElementById("list");
const newNameInput=document.getElementById("newName");

/* データ */
let users=JSON.parse(localStorage.getItem("users"))||{};
let currentUser=null;
let role=null;
let boxes=JSON.parse(localStorage.getItem("boxes"))||[];
let works=JSON.parse(localStorage.getItem("works"))||[];
const LEADER_PASS="bungaku";

/* 共通 */
function hideAllSections(){ 
  [homeSection,loginSection,signupSection,boxArea,submitArea,listArea,accountArea].forEach(e=>e.classList.add("hidden")); 
  logoutBtn.classList.add("hidden"); 
}
function updateLoginInfo(){ loginInfo.textContent=`ログイン中のアカウント：${currentUser||"なし"}`; }
function backToHome(){ hideAllSections(); homeSection.classList.remove("hidden"); document.body.className=""; updateLoginInfo(); }
function backToLogin(){ hideAllSections(); loginSection.classList.remove("hidden"); }

/* モード選択 */
document.getElementById("btnMember").addEventListener("click",()=>{
    hideAllSections(); loginSection.classList.remove("hidden"); homeSection.classList.add("hidden");
});
document.getElementById("btnLeader").addEventListener("click",()=>{
    hideAllSections(); homeSection.classList.add("hidden"); enterLeader();
});

/* 部員ログイン */
document.getElementById("loginBtn").addEventListener("click", handleMemberLogin);
function handleMemberLogin(){ 
    const name=loginNameInput.value.trim(); const pass=loginPassInput.value;
    if(!name||!pass){ alert("名前とパスワードを入力してください"); return; }
    if(!users[name]){ alert("アカウントが存在しません"); return; }
    if(users[name].pass!==pass){ alert("パスワードが違います"); return; }
    currentUser=name; updateLoginInfo(); startApp();
}

/* 新規作成 */
document.getElementById("createBtn").addEventListener("click", ()=>{
    const name=signupNameInput.value.trim(); const pass=signupPassInput.value;
    if(!name||!pass){ alert("名前とパスワードを入力してください"); return; }
    if(users[name]){ alert("その名前はすでに使われています"); return; }
    users[name]={pass};
    localStorage.setItem("users",JSON.stringify(users));
    alert("アカウントを作成しました。ログインしてください");
    signupNameInput.value=""; signupPass.value="";
    backToLogin();
});

/* 部長ログイン */
function enterLeader(){
    if(!currentUser){ alert("まず自分のアカウントでログインしてください"); backToLogin(); return; }
    const p=prompt("部長パスワードを入力してください");
    if(p!==LEADER_PASS){ alert("パスワードが違います"); return; }
    role="leader"; startApp();
}

/* アプリ開始 */
function startApp(){
    hideAllSections();
    document.body.className=role?role+"Mode":"";
    submitArea.classList.remove("hidden");
    listArea.classList.remove("hidden");
    logoutBtn.classList.remove("hidden");
    updateLoginInfo();
    if(role==="member"){ accountArea.classList.remove("hidden"); }
    if(role==="leader"){ boxArea.classList.remove("hidden"); }
    renderBoxes(); renderList();
}

/* ログアウト */
logoutBtn.addEventListener("click", ()=>{ currentUser=null; role=null; backToHome(); updateLoginInfo(); });

/* 戻るボタン */
document.getElementById("backHome1").addEventListener("click", backToHome);
document.getElementById("backLogin").addEventListener("click", backToLogin);
document.getElementById("signupBtn").addEventListener("click", ()=>{ hideAllSections(); signupSection.classList.remove("hidden"); });

/* 名前変更部員 */
document.getElementById("changeNameBtn").addEventListener("click", changeName);
function changeName(){
    const newName=newNameInput.value.trim(); if(!newName){ alert("入力してください"); return; }
    if(users[newName]){ alert("その名前はすでに使われています"); return; }
    users[newName]=users[currentUser]; delete users[currentUser];
    works.forEach(w=>{ if(w.user===currentUser) w.user=newName; });
    currentUser=newName;
    localStorage.setItem("users",JSON.stringify(users));
    localStorage.setItem("works",JSON.stringify(works));
    updateLoginInfo(); alert("名前を変更しました");
}

/* 提出箱作成 */
document.getElementById("createBoxBtn").addEventListener("click", ()=>{
    if(!boxTitleInput.value || !boxDeadlineInput.value){ alert("タイトルと締切日を入力してください"); return; }
    boxes.push({title:boxTitleInput.value, deadline:boxDeadlineInput.value});
    localStorage.setItem("boxes",JSON.stringify(boxes));
    renderBoxes();
});

/* 提出箱表示＋締切チェック */
function renderBoxes(){
    boxSelect.innerHTML=""; boxManage.innerHTML="";
    const today=new Date();
    boxes.forEach((b,i)=>{
        const boxDeadline=new Date(b.deadline);
        const opt=document.createElement("option"); 
        opt.value=b.title; 
        opt.textContent=`${b.title}（締切 ${b.deadline}）`;
        if(boxDeadline<today) opt.disabled=true;
        boxSelect.appendChild(opt);

        if(role==="leader"){
            const div=document.createElement("div");
            div.innerHTML=`${opt.textContent} <button onclick="deleteBox(${i})">削除</button>`;
            boxManage.appendChild(div);
        }
    });
}

/* 提出箱削除 */
function deleteBox(index){ if(!confirm("削除しますか？")) return; boxes.splice(index,1); localStorage.setItem("boxes",JSON.stringify(boxes)); renderBoxes(); }

/* 提出 */
document.getElementById("submitWorkBtn").addEventListener("click", ()=>{
    if(!currentUser){ alert("ログインしてください"); return; }
    if(!boxSelect.value){ alert("提出箱を選択してください"); return; }
    if(!workTitleInput.value){ alert("作品名を入力してください"); return; }

    const work={ user:currentUser, box:boxSelect.value, title:workTitleInput.value, text:textContentInput.value, time:new Date().toLocaleString() };
    works.push(work); localStorage.setItem("works",JSON.stringify(works));
    renderList();
    workTitleInput.value=""; textContentInput.value=""; fileInput.value="";
    alert("提出しました");
});

/* 提出一覧カード化 */
function renderList(){
    list.innerHTML="";
    works.forEach(w=>{
        if(role==="member" && w.user!==currentUser) return;
        const div=document.createElement("div"); div.className="workCard";
        div.innerHTML=`<strong>${w.title}</strong><br>提出箱：${w.box}<br>提出日時：${w.time}<br><pre>${w.text||""}</pre>`;
        list.appendChild(div);
    });
}
