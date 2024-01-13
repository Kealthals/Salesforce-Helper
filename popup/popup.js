document.getElementById('navigateButton').addEventListener('click', function() {
    const tempTextArea = document.createElement('textarea');
    document.body.appendChild(tempTextArea);
    tempTextArea.focus();
    document.execCommand('paste');
    const clipboardText = tempTextArea.value;
    document.body.removeChild(tempTextArea);
    
    if(!validateVariable(clipboardText)){
        return;
    }
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        const tab = tabs[0];
        const url = new URL(tab.url);
        if(!isSalesforceURL(url)){
            return;
        }
        const newUrl = `${url.origin}/${clipboardText}`;
        chrome.tabs.create({url: newUrl, index: tab.index + 1});
    });
});

document.getElementById('GetSSID').addEventListener('click', async function() {
    let activeOrgPrefix = await getAllActivateSFDomain();
    let sessionIDs = await getAllSalesforceSessionIDs();
    sessionIDs = sessionIDs.filter(sessionID => activeOrgPrefix.includes(sessionID.domain.split('.')[0]));
    let div = document.getElementById('SSID');
    div.innerHTML = '';
    let table = document.createElement('table');
    table.style.width = '700px';
    table.setAttribute('border', '1');
    let thead = document.createElement('thead');
    let tbody = document.createElement('tbody');
    let tr = document.createElement('tr');
    let th1 = document.createElement('th');
    th1.style.width = '400px';
    th1.style.textAlign = 'center';
    th1.style.verticalAlign = 'middle';
    th1.style.wordBreak = 'break-all';
    let th2 = document.createElement('th');
    th2.style.width = '400px';
    th2.style.textAlign = 'center';
    th2.style.verticalAlign = 'middle';
    th2.style.wordBreak = 'break-all';
    th1.innerHTML = "Domain";
    th2.innerHTML = "SSID";
    tr.appendChild(th1);
    tr.appendChild(th2);
    thead.appendChild(tr);
    table.appendChild(thead);
    sessionIDs.forEach(sessionID => {
        let tr = document.createElement('tr');
        let td1 = document.createElement('td');
        td1.style.width = '200px';
        td1.style.textAlign = 'left';
        td1.style.verticalAlign = 'middle';
        td1.style.wordBreak = 'break-all';
        let td2 = document.createElement('td');
        td2.style.width = '400px';
        td2.style.textAlign = 'left';
        td2.style.verticalAlign = 'middle';
        td2.style.wordBreak = 'break-all';
        td1.innerHTML = sessionID.domain;
        td2.innerHTML = sessionID.sid;
        tr.appendChild(td1);
        tr.appendChild(td2);
        tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    div.appendChild(table);
});

function validateVariable(value) {
    var pattern = /^[0-9a-zA-Z]{15}(?:[0-9a-zA-Z]{3})?$/;
    return pattern.test(value);
}
function isSalesforceURL(url) {
    var salesforceDomains = [
        /\.lightning\.force\.com/,
        /\.salesforce\.com/
    ];
    for (var i = 0; i < salesforceDomains.length; i++) {
        if (salesforceDomains[i].test(url)) {
            return true;
        }
    }
    return false;
}

function getAllSalesforceSessionIDs() {
    return new Promise(function(resolve, reject) {
        chrome.cookies.getAll({domain: ".salesforce.com", name: 'sid'}, function(cookies) {
            if (cookies && cookies.length > 0) {
                let sessionIDs = cookies.map(cookie => ({ domain: cookie.domain, sid: cookie.value }));
                resolve(sessionIDs);
            } else {
                reject('No Salesforce session IDs found');
            }
        });
    });
}

function getAllActivateSFDomain() {
    // get all domains from tabs of force.com and salesforce.com
    return new Promise(function(resolve, reject) {
        chrome.tabs.query({url: ["*://*.salesforce.com/*", "*://*.force.com/*"]}, function(tabs) {
            if (tabs && tabs.length > 0) {
                // get the prefix of the domain
                let domains = tabs.map(tab => (new URL(tab.url)).origin.split('.')[0].replace('https://', '').replace('http://', ''));
                resolve(domains);
            } else {
                reject('No Salesforce domains found');
            }
        });
    });

}

