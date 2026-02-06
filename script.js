// Dark Mode
window.addEventListener('DOMContentLoaded', () => {
    const darkMode = localStorage.getItem('darkMode');
    if(darkMode === 'enabled') document.body.classList.add('dark');
});
function toggleDarkMode(){
    document.body.classList.toggle('dark');
    localStorage.setItem('darkMode', document.body.classList.contains('dark') ? 'enabled':'disabled');
}

// Initialize mock accounts
if(!localStorage.getItem('accounts')){
    localStorage.setItem('accounts', JSON.stringify([
        {name:'John Doe', balance:1000},
        {name:'Jane Smith', balance:2500},
        {name:'Alice Johnson', balance:1800}
    ]));
}

// Tabs
function showTab(tabId){
    document.querySelectorAll('.dashboard-tab').forEach(t=>t.style.display='none');
    document.getElementById(tabId).style.display='block';
}

// Admin Login
function adminLogin(){
    const u = document.getElementById('admin-username').value;
    const p = document.getElementById('admin-password').value;
    const e = document.getElementById('login-error');
    if(u==='admin' && p==='admin'){
        document.getElementById('login').style.display='none';
        document.getElementById('admin-dashboard').style.display='block';
        e.textContent='';
        renderAccounts();
        populateSelects();
        showTab('deposit-tab');
    } else e.textContent='Incorrect username or password';
}

// Render Accounts Table
function renderAccounts(){
    const accounts = JSON.parse(localStorage.getItem('accounts'));
    const tbody = document.getElementById('account-table-body');
    tbody.innerHTML='';
    accounts.forEach((acc,i)=>{
        const row=document.createElement('tr');
        row.innerHTML=`
        <td>${acc.name}</td>
        <td>${acc.balance.toFixed(2)}</td>
        <td><input type="number" id="dep-${i}" placeholder="0"></td>
        <td><input type="number" id="with-${i}" placeholder="0"></td>
        <td>
            <button onclick="updateAccount(${i})">Update</button>
            <button onclick="deleteAccount(${i})" style="background:#ff4d4d;color:#fff;">Delete</button>
        </td>`;
        tbody.appendChild(row);
    });
    populateSelects();
}

// Deposit/Withdraw
function updateAccount(i){
    const accounts=JSON.parse(localStorage.getItem('accounts'));
    const dep=parseFloat(document.getElementById(`dep-${i}`).value)||0;
    const wit=parseFloat(document.getElementById(`with-${i}`).value)||0;
    accounts[i].balance=Math.max(0, accounts[i].balance+dep-wit);
    localStorage.setItem('accounts', JSON.stringify(accounts));
    renderAccounts();
}

// Delete
function deleteAccount(i){
    const accounts=JSON.parse(localStorage.getItem('accounts'));
    accounts.splice(i,1);
    localStorage.setItem('accounts', JSON.stringify(accounts));
    renderAccounts();
}

// Add Account
function addAccount(e){
    e.preventDefault();
    const n=document.getElementById('new-account-name').value;
    const b=parseFloat(document.getElementById('new-account-balance').value);
    if(n && !isNaN(b) && b>=0){
        const accounts=JSON.parse(localStorage.getItem('accounts'));
        accounts.push({name:n,balance:b});
        localStorage.setItem('accounts', JSON.stringify(accounts));
        renderAccounts();
        document.getElementById('add-account-form').reset();
    }
}

// Populate selects
function populateSelects(){
    const accounts=JSON.parse(localStorage.getItem('accounts'));
    const from=document.getElementById('transfer-from');
    const to=document.getElementById('transfer-to');
    const req=document.getElementById('request-to');
    [from,to,req].forEach(s=>s.innerHTML='');
    accounts.forEach((acc,i)=>{
        const opt=`<option value="${i}">${acc.name}</option>`;
        from.innerHTML+=opt;
        to.innerHTML+=opt;
        req.innerHTML+=opt;
    });
}

// Transfer
function transferMoney(e){
    e.preventDefault();
    const accounts=JSON.parse(localStorage.getItem('accounts'));
    const f=parseInt(document.getElementById('transfer-from').value);
    const t=parseInt(document.getElementById('transfer-to').value);
    const a=parseFloat(document.getElementById('transfer-amount').value);
    if(f===t){ alert("Cannot transfer to same account"); return; }
    if(a>0 && accounts[f].balance>=a){
        accounts[f].balance-=a;
        accounts[t].balance+=a;
        localStorage.setItem('accounts', JSON.stringify(accounts));
        renderAccounts();
        document.getElementById('transfer-form').reset();
    } else alert("Invalid transfer amount");
}

// Request Money
function requestMoney(e){
    e.preventDefault();
    const accounts=JSON.parse(localStorage.getItem('accounts'));
    const t=parseInt(document.getElementById('request-to').value);
    const a=parseFloat(document.getElementById('request-amount').value);
    if(a>0){ accounts[t].balance+=a; localStorage.setItem('accounts', JSON.stringify(accounts)); renderAccounts(); document.getElementById('request-form').reset(); }
    else alert("Invalid amount");
}

// Logout
function logoutAdmin(){
    document.getElementById('admin-dashboard').style.display='none';
    document.getElementById('login').style.display='block';
}
// Initialize customer accounts in localStorage if not exist
if(!localStorage.getItem('customers')){
    localStorage.setItem('customers', JSON.stringify([]));
}

// Customer Register
function customerRegister(){
    const username = document.getElementById('cust-username').value.trim();
    const password = document.getElementById('cust-password').value.trim();
    const error = document.getElementById('cust-error');
    if(!username || !password){ error.textContent='Please fill both fields'; return; }

    let customers = JSON.parse(localStorage.getItem('customers'));
    if(customers.find(c => c.username===username)){ error.textContent='Username already exists'; return; }

    customers.push({username, password, balance:0, transactions:[]});
    localStorage.setItem('customers', JSON.stringify(customers));
    error.textContent='Registered! You can now login';
    document.getElementById('cust-username').value='';
    document.getElementById('cust-password').value='';
}

// Customer Login
function customerLogin(){
    const username = document.getElementById('cust-username').value.trim();
    const password = document.getElementById('cust-password').value.trim();
    const error = document.getElementById('cust-error');
    let customers = JSON.parse(localStorage.getItem('customers'));
    const user = customers.find(c => c.username===username && c.password===password);
    if(user){
        document.getElementById('customer').style.display='none';
        document.getElementById('customer-dashboard').style.display='block';
        document.getElementById('cust-name').textContent=username;
        localStorage.setItem('currentCustomer', username);
        updateCustDashboard();
    } else { error.textContent='Invalid username or password'; }
}

// Update Customer Dashboard
function updateCustDashboard(){
    let customers = JSON.parse(localStorage.getItem('customers'));
    const current = localStorage.getItem('currentCustomer');
    const user = customers.find(c => c.username===current);
    if(!user) return;
    document.getElementById('cust-balance').textContent=user.balance.toFixed(2);

    // Populate transfer options
    const select = document.getElementById('cust-transfer-to');
    select.innerHTML='';
    customers.filter(c=>c.username!==current).forEach(c=>{
        select.innerHTML+=`<option value="${c.username}">${c.username}</option>`;
    });

    // Transaction history
    const ul = document.getElementById('cust-transactions');
    ul.innerHTML='';
    user.transactions.slice().reverse().forEach(tx=>{
        const li = document.createElement('li');
        li.textContent=tx;
        ul.appendChild(li);
    });
}

// Deposit
function custDeposit(){
    const amount = parseFloat(document.getElementById('cust-deposit').value);
    if(isNaN(amount) || amount<=0){ alert("Invalid amount"); return; }
    let customers = JSON.parse(localStorage.getItem('customers'));
    const current = localStorage.getItem('currentCustomer');
    const user = customers.find(c=>c.username===current);
    user.balance+=amount;
    user.transactions.push(`Deposited $${amount.toFixed(2)}`);
    localStorage.setItem('customers', JSON.stringify(customers));
    document.getElementById('cust-deposit').value='';
    updateCustDashboard();
}

// Withdraw
function custWithdraw(){
    const amount = parseFloat(document.getElementById('cust-withdraw').value);
    let customers = JSON.parse(localStorage.getItem('customers'));
    const current = localStorage.getItem('currentCustomer');
    const user = customers.find(c=>c.username===current);
    if(isNaN(amount) || amount<=0 || amount>user.balance){ alert("Invalid amount"); return; }
    user.balance-=amount;
    user.transactions.push(`Withdrew $${amount.toFixed(2)}`);
    localStorage.setItem('customers', JSON.stringify(customers));
    document.getElementById('cust-withdraw').value='';
    updateCustDashboard();
}

// Transfer
function custTransfer(){
    const toUser = document.getElementById('cust-transfer-to').value;
    const amount = parseFloat(document.getElementById('cust-transfer-amount').value);
    let customers = JSON.parse(localStorage.getItem('customers'));
    const current = localStorage.getItem('currentCustomer');
    const sender = customers.find(c=>c.username===current);
    const receiver = customers.find(c=>c.username===toUser);
    if(!receiver || isNaN(amount) || amount<=0 || amount>sender.balance){ alert("Invalid transfer"); return; }
    sender.balance-=amount;
    receiver.balance+=amount;
    sender.transactions.push(`Transferred $${amount.toFixed(2)} to ${toUser}`);
    receiver.transactions.push(`Received $${amount.toFixed(2)} from ${current}`);
    localStorage.setItem('customers', JSON.stringify(customers));
    document.getElementById('cust-transfer-amount').value='';
    updateCustDashboard();
}

// Logout
function custLogout(){
    localStorage.removeItem('currentCustomer');
    document.getElementById('customer-dashboard').style.display='none';
    document.getElementById('customer').style.display='block';
}
