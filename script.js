/* ============================================================
   The Ledger — script.js
   1. Helpers and storage
   2. Data (accounting schedule, payroll steps, analyst path)
   3. Trackers, tabs, payroll calculator, theme
   4. Live demos for the Excel projects and finance tools
   5. Start-up
   ============================================================ */
'use strict';

/* ---------- 1. Helpers and storage ---------- */
const $ = (id) => document.getElementById(id);
const fmt = (n) => Math.round(n).toLocaleString('en-US');
const fmt2 = (n) => Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const num = (v) => { const n = parseFloat(v); return isFinite(n) ? n : 0; };

// Uses window.storage when the page is hosted as a Claude artifact, and
// falls back to the browser's localStorage everywhere else.
const store = {
  async get(key) {
    try {
      if (window.storage && window.storage.get) {
        const r = await window.storage.get(key, false);
        if (r && r.value != null) return r.value;
      }
    } catch (e) { /* fall through */ }
    try { return window.localStorage.getItem(key); } catch (e) { return null; }
  },
  async set(key, value) {
    try {
      if (window.storage && window.storage.set) { await window.storage.set(key, value, false); return; }
    } catch (e) { /* fall through */ }
    try { window.localStorage.setItem(key, value); } catch (e) { console.error('Could not save', key, e); }
  }
};

/* ---------- 2. Data ---------- */
const scheduleData = [
  { title: "Foundations — the equation, debits &amp; credits, journal entries", tasks: [
    { label: "Learn the accounting equation: Assets = Liabilities + Equity", how: [
      "Write the equation at the top of a page: Assets = Liabilities + Equity.",
      "Take five transactions from your own life or business and, for each, name which of the three buckets it touches.",
      "Confirm the equation still balances after each one — if it doesn't, you've mis-bucketed something."
    ]},
    { label: "Memorize the debit/credit golden rules (DEAD CLIC)", how: [
      "Write the table: Assets/Expenses — Debit to increase, Credit to decrease. Liabilities/Equity/Income — Credit to increase, Debit to decrease.",
      "Say the mnemonic out loud: Debit — Expenses, Assets, Drawings. Credit — Liabilities, Income, Capital.",
      "Quiz yourself with 10 random accounts (rent, sales, loan, cash, capital...) and state 'debit' or 'credit' to increase each, without looking at the table."
    ]},
    { label: "Practice writing 20+ journal entries by hand", how: [
      "Use the format: Date / Account / Debit / Credit, one line per side, with a short narration underneath.",
      "Start simple: cash purchases and cash sales, one line of Dr and one of Cr each.",
      "Move to credit transactions: 'Dr Accounts Receivable / Cr Sales Revenue' for a sale on credit, 'Dr Purchases / Cr Accounts Payable' for a purchase on credit.",
      "For each entry, check that total debits equal total credits before moving to the next one."
    ]}
  ]},
  { title: "Ledger posting", tasks: [
    { label: "Post journal entries to T-accounts", how: [
      "Draw a T for every account that appears in your Week 1 journal entries.",
      "For each journal entry, post the debit amount to the left of its account's T and the credit amount to the right of the other account's T.",
      "Label each posting with its date so you can trace it back to the journal."
    ]},
    { label: "Balance each ledger account at period end", how: [
      "Total the debit side and the credit side of each T-account separately.",
      "Subtract the smaller total from the larger — that difference is the account's closing balance.",
      "Note which side the balance sits on: asset/expense accounts normally close on the debit side, liability/equity/income accounts on the credit side."
    ]},
    { label: "Practice with at least one full week of transactions", how: [
      "Invent or use real transactions for five business days — sales, a rent payment, a supplier bill, a bank deposit.",
      "Journal each one first, then post all of them to T-accounts.",
      "Balance every account you touched and write down each closing balance."
    ]}
  ]},
  { title: "Trial balance, errors, adjustments", tasks: [
    { label: "Extract a trial balance from your ledger", how: [
      "List every ledger account down the left, with a Debit column and a Credit column.",
      "Enter each account's closing balance in the column matching the side it fell on.",
      "Total both columns — if they match, your trial balance balances."
    ]},
    { label: "Learn the common errors it won't catch", how: [
      "Write out the three classic ones: a transaction posted entirely to the wrong account, an omitted transaction, and a transposition (e.g. 4,500 entered as 5,400) that happens on both sides.",
      "Understand why the trial balance stays balanced in each case — both sides are still equal, just wrong.",
      "If your totals genuinely don't match, look instead for a one-sided posting, a wrong-side entry, or an arithmetic slip."
    ]},
    { label: "Practice adjusting entries: depreciation, accruals, prepayments, bad debts", how: [
      "Depreciation: pick a fixed asset, apply a wear-and-tear rate, and journal 'Dr Depreciation Expense / Cr Accumulated Depreciation'.",
      "Accrual: an expense incurred but not yet billed — journal 'Dr Expense / Cr Accrued Liability'.",
      "Prepayment: an expense paid in advance — journal 'Dr Prepaid Expense (asset) / Cr Cash', then release it to expense over the period it covers.",
      "Bad debt: a debtor unlikely to pay — journal 'Dr Bad Debt Expense / Cr Accounts Receivable'."
    ]}
  ]},
  { title: "Basic financial statements", tasks: [
    { label: "Build a Statement of Profit or Loss (Income − Expenses)", how: [
      "From your adjusted trial balance, list every income account and sum them.",
      "List every expense account and sum them.",
      "Subtract total expenses from total income — that's your profit or loss for the period."
    ]},
    { label: "Build a Statement of Financial Position (Assets = Liabilities + Equity)", how: [
      "List every asset account balance and total them.",
      "List every liability account balance and total them.",
      "Add the period's profit (or subtract a loss) into equity, then confirm Assets = Liabilities + Equity."
    ]},
    { label: "Walk one full worked example from trial balance to both statements", how: [
      "Take the sample trial balance in the Bookkeeping tab (Module 5) and sort each line into income, expense, asset, liability, or equity.",
      "Produce the P&amp;L first, since the profit figure feeds into equity.",
      "Then produce the Statement of Financial Position and confirm it balances."
    ]}
  ]},
  { title: "Kenyan tax framework", tasks: [
    { label: "Study VAT basics — rate, filing deadline, input/output VAT", how: [
      "Note the standard rate (16%) and which supplies are exempt, zero-rated, or standard-rated.",
      "Understand output VAT (charged on sales) minus input VAT (paid on purchases) = VAT payable or refundable.",
      "Note the filing deadline — by the 20th of the following month — and what happens if you file late."
    ]},
    { label: "Study PAYE basics — bands, relief, filing deadline", how: [
      "Look up the current PAYE tax bands on the KRA website (they change with each Finance Act).",
      "Note the personal relief amount and how it's deducted from tax payable, not from income.",
      "Note the filing/remittance deadline — by the 9th of the following month."
    ]},
    { label: "Study Withholding Tax basics", how: [
      "List the payment types it applies to: rent, professional fees, dividends, and similar.",
      "Note that the payer withholds the tax and remits it directly to KRA on the payee's behalf.",
      "Check the current WHT rate for two or three payment types relevant to your own work."
    ]},
    { label: "Check the KRA website for this year's Finance Act updates", how: [
      "Search 'KRA Finance Act' for the current year and skim the summary of changes.",
      "Compare any changed rate or threshold against what you noted above and correct it.",
      "Bookmark the page — this is a check to repeat every filing period, not a one-time read."
    ]}
  ]},
  { title: "Hands-on: iTax &amp; eTIMS", tasks: [
    { label: "Create a KRA iTax account if you have a PIN", how: [
      "Go to the iTax portal and register using your KRA PIN.",
      "Set up your login and complete any KYC/profile details it asks for.",
      "Explore the returns menu so you know where VAT, PAYE, and other returns are filed before you actually owe one."
    ]},
    { label: "Explore the eTIMS demo/training materials", how: [
      "Find KRA's eTIMS user guide and read the section for your business type (web portal, app, or API/ERP integration).",
      "Note the three ways to generate an invoice and which one fits how you already do business.",
      "Identify what counts as an eTIMS-compliant invoice, since only those are tax-deductible for the payer."
    ]},
    { label: "Walk through how an eTIMS invoice number and QR code are generated", how: [
      "Trace the sequence: invoice raised → submitted to eTIMS → KRA validates it → invoice number and QR code are returned.",
      "Note what the QR code is for — it lets anyone verify the invoice was actually validated by KRA.",
      "Compare that to a bill you receive from a supplier and check whether it carries the same validation."
    ]}
  ]},
  { title: "Practice in software", tasks: [
    { label: "Set up a free tool — Wave or Manager.io — or QuickBooks trial", how: [
      "Create an account and set up a chart of accounts that matches the ones you've been using on paper.",
      "Enter your opening balances so the books start from a real position.",
      "Familiarize yourself with where journal entries, invoices, and bills live in the interface."
    ]},
    { label: "Enter a full month of transactions end-to-end", how: [
      "Enter every sale as an invoice and every supplier purchase as a bill, rather than as raw journal entries where the software allows it.",
      "Record every cash and bank movement, including M-Pesa Paybill/Till settlements.",
      "Let the software post to the ledger automatically, then spot-check a few postings against what you'd expect by hand."
    ]},
    { label: "Reconcile the bank/M-Pesa statement against your entries", how: [
      "Pull the real bank/M-Pesa statement for the month.",
      "Match each statement line to an entry in your books, ticking off both as you go.",
      "Investigate anything left unmatched on either side — a timing difference, a bank charge you didn't record, or a duplicate entry."
    ]}
  ]},
  { title: "Consolidate", tasks: [
    { label: "Run your own trial balance from the month you entered", how: [
      "Generate the trial balance report from your software.",
      "Confirm debits equal credits.",
      "Cross-check two or three balances against your manual ledger from earlier weeks."
    ]},
    { label: "Produce a P&amp;L and Balance Sheet from it", how: [
      "Generate both reports from the software.",
      "Manually re-derive the profit figure from income minus expenses and confirm it matches.",
      "Confirm the Balance Sheet balances: Assets = Liabilities + Equity."
    ]},
    { label: "List every statutory filing that month's activity would trigger", how: [
      "Go through the Taxes tab and mark which taxes apply to what you entered — VAT, PAYE, WHT, and so on.",
      "Note the deadline for each one against the month you just closed.",
      "Write down, for each, what iTax return you'd file and what figure would go on it."
    ]}
  ]}
];

const payrollData = [
  { label: "Collect timesheets/attendance and compute gross pay", how: [
    "Pull attendance/timesheet records for the full pay period from every department.",
    "For salaried staff, confirm any unpaid leave or mid-month joiners/leavers that would pro-rate the month.",
    "For hourly or commission staff, multiply hours or sales by the agreed rate to get gross pay."
  ]},
  { label: "Calculate statutory deductions: PAYE, NSSF, SHIF, AHL", how: [
    "Compute NSSF first (it's usually deducted before PAYE is calculated).",
    "Apply the current PAYE bands to the taxable pay to get gross tax.",
    "Compute SHIF and the employee's 1.5% Housing Levy on gross pay.",
    "Cross-check every rate against the current KRA/NSSF/SHIF figures — see the Taxes tab formulas."
  ]},
  { label: "Apply personal relief and any allowable reliefs", how: [
    "Subtract the KES 2,400 monthly personal relief from gross PAYE, not from income.",
    "Add any other allowable reliefs the employee qualifies for — insurance, mortgage interest, pension contributions.",
    "The result is the final PAYE payable for that employee."
  ]},
  { label: "Compute net pay", how: [
    "Start from gross pay and subtract NSSF, PAYE, SHIF, and the employee's Housing Levy share.",
    "Subtract any other agreed deductions — loan repayments, advances, union dues.",
    "The figure left is what actually gets paid out."
  ]},
  { label: "Generate payslips", how: [
    "List gross pay, each statutory deduction, any other deductions, and net pay separately — never just a lump sum.",
    "Include the employee's KRA PIN and NSSF/SHIF numbers for their own records.",
    "Issue payslips before or on the pay date, not after."
  ]},
  { label: "Remit statutory deductions to KRA, NSSF, SHIF by their due dates", how: [
    "Total each deduction across all employees to get the company-wide remittance figure.",
    "Add the matching employer contributions (NSSF employer share, Housing Levy employer 1.5%).",
    "Pay each one through its own channel — iTax for PAYE, and the NSSF/SHIF portals — before the 9th of the following month."
  ]},
  { label: "File the monthly PAYE return on iTax", how: [
    "Log in to iTax and open the PAYE return for the period.",
    "Enter each employee's taxable pay, PAYE, and relief — most payroll software can export this directly.",
    "Submit before the 9th and keep the acknowledgement receipt."
  ]},
  { label: "Reconcile payroll control accounts against the general ledger", how: [
    "Post the payroll journal: Dr Salaries Expense, Cr Net Pay Payable, Cr PAYE Payable, Cr NSSF Payable, Cr SHIF Payable, Cr Housing Levy Payable.",
    "Confirm each statutory control account balance matches what you actually remitted.",
    "Clear each control account to zero once the remittance is paid and matched."
  ]},
  { label: "Issue P9 forms annually for employee tax returns", how: [
    "Summarize each employee's full-year gross pay, deductions, and PAYE paid.",
    "Generate the P9 in the format KRA expects, one per employee.",
    "Distribute P9 forms early enough for employees to file their own annual returns on time."
  ]}
];

const analystData = [
  { title: "Core functions (weeks 1–2)", tasks: [
    { label: "Master the aggregation family: SUM, AVERAGE, COUNT, COUNTIF(S), SUMIF(S)", how: [
      "Build a 30-row sales list with Date, Item, Branch, Qty, Price and Amount columns.",
      "Total and average it with SUM and AVERAGE, then answer five questions with COUNTIFS and SUMIFS (for example, total sales for the Nairobi branch in September).",
      "Check each answer by filtering the list and comparing with the total shown in the status bar."
    ]},
    { label: "Learn logic: IF, nested IF, IFS, AND, OR, IFERROR", how: [
      "Write an IF that labels a sale 'High' when it is 10,000 or more.",
      "Extend it to three tiers with IFS, then combine AND/OR to flag invoices that are both overdue and unpaid.",
      "Wrap your lookups in IFERROR so a missing code shows 'Not found' instead of #N/A."
    ]},
    { label: "Learn lookups: XLOOKUP, VLOOKUP, INDEX/MATCH", how: [
      "Create a price-list table and a transactions table that holds only product codes.",
      "Pull each price with XLOOKUP, then rebuild the same column with VLOOKUP and with INDEX/MATCH and compare.",
      "Delete one code from the price list and handle the error using XLOOKUP's if_not_found argument."
    ]},
    { label: "Learn text and date functions", how: [
      "Clean a messy list of names and PINs with TRIM, LEFT, RIGHT, MID and TEXT.",
      "Use TODAY, EDATE, EOMONTH and DATEDIF to produce due dates and an invoice-ageing column.",
      "Practise on a real bank or M-Pesa statement export: split the date from the narration and extract the reference."
    ]}
  ]},
  { title: "Data analysis and reporting (weeks 3–5)", tasks: [
    { label: "Use Tables, sorting, filtering and Data Validation", how: [
      "Convert your sales list to a Table with Ctrl+T and name it tblSales.",
      "Add dropdown lists (Data Validation) for Branch and Status so entries stay consistent.",
      "Sort by two levels (Branch, then Amount) and save a custom filter view."
    ]},
    { label: "Build PivotTables, slicers and charts", how: [
      "Insert a PivotTable from tblSales showing sales by month and branch.",
      "Add a slicer for Branch and a timeline for Date, then insert a PivotChart.",
      "Use Show Values As → % of Column Total to see each branch's share of sales."
    ]},
    { label: "Apply Conditional Formatting and cleaning tools", how: [
      "Highlight duplicate invoice numbers, and highlight overdue and unpaid rows with a formula rule.",
      "Use Remove Duplicates, Text to Columns and Flash Fill on an untidy import.",
      "Count blanks with COUNTBLANK and fix each missing entry."
    ]},
    { label: "Clean data with Power Query", how: [
      "Data → Get Data → From Workbook/CSV, and load a messy export into the Power Query editor.",
      "Remove columns, set data types, trim text, split columns and fill down; each step is recorded.",
      "Close &amp; Load to a Table, paste new data into the source and press Refresh to see the cleaning repeat on its own."
    ]}
  ]},
  { title: "Build the seven projects (weeks 6–9)", tasks: [
    { label: "Project 1 — Shopping mall calculator", how: [
      "Open the Excel Projects tab, try the demo and note what it does.",
      "Build the price table, the dropdown, the lookup, the discount tiers, VAT and the change calculation.",
      "Protect the formula cells and test with five different baskets."
    ]},
    { label: "Project 2 — Grade sheet and poll results", how: [
      "Create the grade-bands table and the Total, Grade and Rank columns.",
      "Add the class average, highest mark and pass rate.",
      "Collect poll answers (Microsoft Forms or typed), tally them with COUNTIF and chart the result."
    ]},
    { label: "Project 3 — Automated quiz scoring board", how: [
      "Write ten questions, create the hidden answer key and add dropdown answer cells.",
      "Score with SUMPRODUCT, grade with IFS, and mark each answer with a tick or cross.",
      "Keep a Results table and show a sorted leaderboard."
    ]},
    { label: "Project 4 — Digital clock", how: [
      "Format a merged cell as hh:mm:ss AM/PM.",
      "Add the StartClock and StopClock macros and two buttons.",
      "Save as .xlsm and confirm the clock keeps ticking, then stops cleanly."
    ]},
    { label: "Project 5 — Automated entry form", how: [
      "First try the built-in Data Form on a Table.",
      "Then build a UserForm with validation that adds a row to the Table.",
      "Enter 20 test records and check totals with SUMIF."
    ]},
    { label: "Project 6 — Loan management system", how: [
      "Build the instalment with PMT, then a 24-month schedule with IPMT, PPMT and a running balance.",
      "Add repayment tracking columns: date paid, days late, penalty.",
      "Compare reducing-balance with flat-rate interest for the same loan and note the difference."
    ]},
    { label: "Project 7 — Dynamic database system", how: [
      "Create tblClients with unique IDs and a county-to-town dependent dropdown.",
      "Add a search sheet using FILTER and SEARCH, with a status dropdown.",
      "Protect the sheets, save a dated backup and write a Read me sheet."
    ]}
  ]},
  { title: "Financial analysis (weeks 10–11)", tasks: [
    { label: "Build statements and ratios from a trial balance", how: [
      "Load a trial balance into a Table with an Account Type column.",
      "Produce the Statement of Profit or Loss and Statement of Financial Position with SUMIFS and add a balance check.",
      "Calculate current ratio, quick ratio, gross margin, net margin, debtor days and creditor days."
    ]},
    { label: "Do budget-versus-actual and variance analysis", how: [
      "Set up Budget and Actual columns by account and month.",
      "Calculate variance in shillings and in percent, and flag favourable and adverse variances.",
      "Chart the five largest variances and write two sentences explaining each."
    ]},
    { label: "Use NPV, IRR and depreciation functions", how: [
      "Model a small equipment purchase: cost, yearly cash inflows, a discount rate.",
      "Calculate NPV and IRR and decide whether to accept it.",
      "Compare straight-line (SLN) with reducing-balance (DB) depreciation over the asset's life."
    ]},
    { label: "Build a 13-week cash-flow forecast", how: [
      "List opening cash, receipts, payments (including PAYE, VAT and loan instalments on their due dates) and closing cash by week.",
      "Pull receipts and payments from your invoice and bill ageing with SUMIFS.",
      "Highlight weeks where closing cash falls below your minimum balance."
    ]}
  ]},
  { title: "Beyond Excel and career (week 12 onward)", tasks: [
    { label: "Learn Power Pivot and DAX measures", how: [
      "Load Sales, Customers and a Calendar table into the Data Model and relate them.",
      "Write Total Sales, Sales YTD, Sales LY and Growth % measures.",
      "Build a PivotTable that uses only your measures."
    ]},
    { label: "Build a Power BI dashboard", how: [
      "Install Power BI Desktop and import your sales workbook.",
      "Build a one-page report with KPI cards, a trend line, a branch breakdown and slicers.",
      "Publish it, or export screenshots for your portfolio."
    ]},
    { label: "Learn SQL basics", how: [
      "Practise SELECT, WHERE, ORDER BY, GROUP BY and HAVING on a free practice site or a local SQLite database.",
      "Learn INNER and LEFT JOIN by joining sales to customers.",
      "Write one query with a window function such as RANK()."
    ]},
    { label: "Try Python with pandas", how: [
      "Install Python or use a free online notebook.",
      "Load a CSV with pandas, clean it, group it with groupby and plot the result.",
      "Redo one of your Excel projects in pandas and compare the effort."
    ]},
    { label: "Publish a portfolio and update your CV", how: [
      "Write a one-page summary for each of three to five projects: problem, data, method, result.",
      "Host them where employers can open them (for example a public GitHub repository or a shared folder) using dummy data only.",
      "Rewrite your CV bullets around outcomes and tools, and apply to five roles a week."
    ]},
    { label: "Teach what you learned (instructor path)", how: [
      "Run a 30-minute session for colleagues on one topic, such as PivotTables.",
      "Record three five-minute tutorials and ask for feedback.",
      "Draft a six-session beginner curriculum and plan your first small paid or in-house cohort."
    ]}
  ]}
];

/* ---------- 3. Trackers, tabs, payroll, theme ---------- */
const SCHEDULE_KEY = 'kenya-accountant-progress';
const ANALYST_KEY = 'kenya-analyst-progress';
let progress = {};
let analystProgress = {};

async function loadState(key) {
  try {
    const raw = await store.get(key);
    return raw ? JSON.parse(raw) : {};
  } catch (e) { return {}; }
}

// One renderer for both checklists. State keys are "groupIndex-taskIndex".
function createTracker(cfg) {
  const mount = $(cfg.mount);
  if (!mount) return;
  const key = (g, t) => g + '-' + t;

  mount.innerHTML = cfg.data.map((grp, gi) => `
    <div class="week${gi === 0 ? ' open' : ''}" data-group="${gi}">
      <div class="week-head">
        <div class="week-num">${gi + 1}</div>
        <h4>${cfg.groupName} ${gi + 1} — ${grp.title}</h4>
        <div class="week-check"></div>
        <div class="week-caret">&#9656;</div>
      </div>
      <div class="week-body">
        ${grp.tasks.map((t, ti) => {
          const k = key(gi, ti);
          const done = cfg.state[k];
          const steps = (t.how || []).map((h) => `<li>${h}</li>`).join('');
          return `<div class="task-row${done ? ' done' : ''}" data-key="${k}">
            <input type="checkbox" id="${cfg.mount}-chk-${k}"${done ? ' checked' : ''}>
            <div class="task-body">
              <label for="${cfg.mount}-chk-${k}">${t.label}</label>
              ${steps ? `<ol class="how-steps">${steps}</ol>` : ''}
            </div>
          </div>`;
        }).join('')}
      </div>
    </div>`).join('');

  function refresh() {
    let total = 0, done = 0;
    cfg.data.forEach((grp, gi) => {
      let d = 0;
      grp.tasks.forEach((_, ti) => { total++; if (cfg.state[key(gi, ti)]) { d++; done++; } });
      const el = mount.querySelector(`.week[data-group="${gi}"] .week-check`);
      if (el) el.textContent = `${d}/${grp.tasks.length}`;
    });
    $(cfg.labelId).textContent = `${done} / ${total} complete`;
    $(cfg.fillId).style.width = total ? `${(done / total * 100).toFixed(0)}%` : '0%';
  }

  mount.addEventListener('click', (e) => {
    const head = e.target.closest('.week-head');
    if (head) head.parentElement.classList.toggle('open');
  });
  mount.addEventListener('change', async (e) => {
    const row = e.target.closest('.task-row');
    if (!row) return;
    cfg.state[row.dataset.key] = e.target.checked;
    row.classList.toggle('done', e.target.checked);
    refresh();
    await store.set(cfg.storageKey, JSON.stringify(cfg.state));
  });

  refresh();
}

function initTabs() {
  const buttons = document.querySelectorAll('nav.tabs button[data-pane]');
  buttons.forEach((btn) => btn.addEventListener('click', () => showPane(btn.dataset.pane)));
  const fromHash = location.hash.replace('#', '');
  if (fromHash && $(fromHash) && $(fromHash).classList.contains('pane')) showPane(fromHash, false);
}

function showPane(id, scroll = true) {
  document.querySelectorAll('nav.tabs button[data-pane]').forEach((b) => b.classList.toggle('active', b.dataset.pane === id));
  document.querySelectorAll('section.pane').forEach((p) => p.classList.toggle('active', p.id === id));
  try { history.replaceState(null, '', '#' + id); } catch (e) { /* file:// or sandboxed */ }
  if (scroll) {
    // Scroll to the top of the content area so the sidebar stays in view
    const layout = document.querySelector('.layout');
    window.scrollTo({ top: layout ? layout.offsetTop : 0, behavior: 'smooth' });
  }
}

function renderPayrollSteps() {
  const list = $('payrollSteps');
  if (!list) return;
  list.innerHTML = payrollData.map((step, i) => `
    <div class="pstep">
      <div class="pstep-head">
        <div class="pnum">${i + 1}</div>
        <div class="plabel">${step.label}</div>
        <div class="pstep-caret">&#9656;</div>
      </div>
      <div class="pstep-body">
        <ol>${step.how.map((h) => `<li>${h}</li>`).join('')}</ol>
      </div>
    </div>`).join('');
  list.querySelectorAll('.pstep-head').forEach((head) => {
    head.addEventListener('click', () => head.closest('.pstep').classList.toggle('open'));
  });
}

function fmtKES(n) {
  const rounded = Math.round(n);
  const abs = Math.abs(rounded).toLocaleString('en-US');
  return rounded < 0 ? `(${abs})` : abs;
}

function calcPayroll(gross) {
  gross = Math.max(0, Number(gross) || 0);
  const nssf = Math.min(gross * 0.06, 4320);
  const taxable = gross - nssf;
  // Example bands: first 24,000 @10%, next 8,333 (to 32,333) @25%, remainder @30%
  let grossTax = Math.min(taxable, 24000) * 0.10;
  if (taxable > 24000) grossTax += (Math.min(taxable, 32333) - 24000) * 0.25;
  if (taxable > 32333) grossTax += (taxable - 32333) * 0.30;
  const paye = Math.max(0, grossTax - 2400);
  const shif = Math.max(gross * 0.0275, 300);
  const ahl = gross * 0.015;
  const net = gross - nssf - paye - shif - ahl;
  return { gross, nssf, taxable, paye, shif, ahl, net };
}

function renderPayrollCalc() {
  const input = $('grossPayInput');
  if (!input) return;
  const r = calcPayroll(input.value);
  $('out-gross').textContent = fmtKES(r.gross);
  $('out-nssf').textContent = `(${fmtKES(r.nssf)})`;
  $('out-taxable').textContent = fmtKES(r.taxable);
  $('out-paye').textContent = `(${fmtKES(r.paye)})`;
  $('out-shif').textContent = `(${fmtKES(r.shif)})`;
  $('out-ahl').textContent = `(${fmtKES(r.ahl)})`;
  $('out-net').textContent = fmtKES(r.net);
}

const THEME_KEY = 'kenya-accountant-theme';

function applyTheme(theme) {
  document.body.classList.toggle('dark', theme === 'dark');
  const btn = $('themeToggle');
  if (btn) btn.innerHTML = theme === 'dark' ? '&#9728; Light' : '&#9789; Dark';
}

/* ---------- 4. Live demos ---------- */

/* Project 1 — shopping mall calculator */
const MALL_ITEMS = [
  ['Rice 2kg', 380], ['Cooking oil 1L', 320], ['Sugar 2kg', 290], ['Maize flour 2kg', 190],
  ['Milk 500ml', 65], ['Bread', 60], ['Bath soap', 120], ['Tissue 10 pack', 450]
];

function initMall() {
  const demo = $('mallDemo');
  if (!demo) return;
  const preset = [[0, 2], [1, 1], [4, 3], ['', 0]];
  const options = '<option value="">— choose item —</option>' +
    MALL_ITEMS.map((it, i) => `<option value="${i}">${it[0]}</option>`).join('');

  demo.innerHTML = `
    <div class="demo-title">LIVE DEMO — PRICES EXCLUDE VAT · DISCOUNT 5% FROM 5,000 · 10% FROM 10,000</div>
    <div style="overflow-x:auto;"><table class="led">
      <tr><th>Item</th><th class="num">Unit price</th><th class="num">Qty</th><th class="num">Line total</th></tr>
      ${preset.map((_, i) => `<tr>
        <td><select data-mall-item="${i}">${options}</select></td>
        <td class="num" data-mall-price="${i}">—</td>
        <td class="num"><input type="number" min="0" step="1" value="${preset[i][1]}" data-mall-qty="${i}"></td>
        <td class="num" data-mall-line="${i}">0</td></tr>`).join('')}
    </table></div>
    <div class="calc-input-row" style="margin-top:12px;">
      <label for="mallCash">Cash tendered (KES)</label>
      <input type="number" id="mallCash" min="0" step="50" value="2000">
    </div>
    <div class="kpis">
      <div class="kpi"><div class="v" id="mallSub">0.00</div><div class="l">Subtotal</div></div>
      <div class="kpi"><div class="v" id="mallDisc">0.00</div><div class="l">Discount</div></div>
      <div class="kpi"><div class="v" id="mallVat">0.00</div><div class="l">VAT 16%</div></div>
      <div class="kpi"><div class="v" id="mallTotal">0.00</div><div class="l">Total to pay</div></div>
      <div class="kpi"><div class="v" id="mallChange">—</div><div class="l">Change</div></div>
    </div>`;

  preset.forEach((p, i) => { demo.querySelector(`[data-mall-item="${i}"]`).value = p[0]; });

  function calc() {
    let sub = 0;
    preset.forEach((_, i) => {
      const sel = demo.querySelector(`[data-mall-item="${i}"]`).value;
      const qty = Math.max(0, num(demo.querySelector(`[data-mall-qty="${i}"]`).value));
      const price = sel === '' ? 0 : MALL_ITEMS[Number(sel)][1];
      const line = price * qty;
      sub += line;
      demo.querySelector(`[data-mall-price="${i}"]`).textContent = sel === '' ? '—' : fmt(price);
      demo.querySelector(`[data-mall-line="${i}"]`).textContent = fmt(line);
    });
    const rate = sub >= 10000 ? 0.10 : sub >= 5000 ? 0.05 : 0;
    const disc = Math.round(sub * rate * 100) / 100;
    const vat = Math.round((sub - disc) * 0.16 * 100) / 100;
    const total = sub - disc + vat;
    const cash = num($('mallCash').value);
    $('mallSub').textContent = fmt2(sub);
    $('mallDisc').textContent = fmt2(disc);
    $('mallVat').textContent = fmt2(vat);
    $('mallTotal').textContent = fmt2(total);
    $('mallChange').textContent = cash <= 0 ? '—' : (cash >= total ? fmt2(cash - total) : 'Short ' + fmt2(total - cash));
  }
  demo.addEventListener('input', calc);
  demo.addEventListener('change', calc);
  calc();
}

/* Project 2 — grade sheet and poll */
function gradeOf(total) {
  return total >= 70 ? 'A' : total >= 60 ? 'B' : total >= 50 ? 'C' : total >= 40 ? 'D' : 'E';
}

function initGrades() {
  const demo = $('gradeDemo');
  if (!demo) return;
  const students = [['Amina', 24, 58], ['Brian', 18, 45], ['Cynthia', 27, 66], ['David', 12, 30], ['Esther', 21, 52]];
  demo.innerHTML = `
    <div class="demo-title">LIVE DEMO — GRADE SHEET (CAT OUT OF 30, EXAM OUT OF 70)</div>
    <div style="overflow-x:auto;"><table class="led">
      <tr><th>Student</th><th class="num">CAT /30</th><th class="num">Exam /70</th><th class="num">Total</th><th>Grade</th><th class="num">Rank</th></tr>
      ${students.map((s, i) => `<tr>
        <td>${s[0]}</td>
        <td class="num"><input type="number" min="0" max="30" value="${s[1]}" data-g-cat="${i}"></td>
        <td class="num"><input type="number" min="0" max="70" value="${s[2]}" data-g-exam="${i}"></td>
        <td class="num" data-g-total="${i}">0</td><td data-g-grade="${i}">-</td><td class="num" data-g-rank="${i}">-</td></tr>`).join('')}
    </table></div>
    <div class="kpis">
      <div class="kpi"><div class="v" id="gAvg">0</div><div class="l">Class average</div></div>
      <div class="kpi"><div class="v" id="gMax">0</div><div class="l">Highest mark</div></div>
      <div class="kpi"><div class="v" id="gPass">0%</div><div class="l">Pass rate (50 and above)</div></div>
    </div>`;

  function calc() {
    const totals = students.map((_, i) => {
      const cat = Math.min(30, Math.max(0, num(demo.querySelector(`[data-g-cat="${i}"]`).value)));
      const exam = Math.min(70, Math.max(0, num(demo.querySelector(`[data-g-exam="${i}"]`).value)));
      return cat + exam;
    });
    totals.forEach((t, i) => {
      demo.querySelector(`[data-g-total="${i}"]`).textContent = fmt(t);
      demo.querySelector(`[data-g-grade="${i}"]`).textContent = gradeOf(t);
      demo.querySelector(`[data-g-rank="${i}"]`).textContent = 1 + totals.filter((x) => x > t).length;
    });
    const sum = totals.reduce((a, b) => a + b, 0);
    $('gAvg').textContent = (sum / totals.length).toFixed(1);
    $('gMax').textContent = Math.max(...totals);
    $('gPass').textContent = Math.round(totals.filter((t) => t >= 50).length / totals.length * 100) + '%';
  }
  demo.addEventListener('input', calc);
  calc();
}

function initPoll() {
  const demo = $('pollDemo');
  if (!demo) return;
  const options = ['Excel', 'Power BI', 'SQL', 'Python'];
  const start = [12, 7, 5, 3];
  let votes = start.slice();

  demo.innerHTML = `
    <div class="demo-title">LIVE DEMO — POLL: WHICH TOOL DO YOU WANT TO LEARN NEXT?</div>
    <div id="pollBars"></div>
    <div style="margin-top:10px; display:flex; gap:8px; flex-wrap:wrap;" id="pollBtns">
      ${options.map((o, i) => `<button class="btn" type="button" data-vote="${i}">Vote ${o}</button>`).join('')}
      <button class="btn" type="button" data-reset="1">Reset</button>
    </div>
    <div class="msg muted" id="pollTotal"></div>`;

  function render() {
    const total = votes.reduce((a, b) => a + b, 0);
    $('pollBars').innerHTML = options.map((o, i) => {
      const pct = total ? votes[i] / total * 100 : 0;
      return `<div class="bar-row"><div class="bar-label">${o}</div>
        <div class="bar-track"><div class="bar-fill" style="width:${pct.toFixed(1)}%"></div></div>
        <div class="bar-val">${votes[i]} · ${pct.toFixed(0)}%</div></div>`;
    }).join('');
    $('pollTotal').textContent = `Total responses: ${total}  (=SUM of COUNTIF results; each share = count / total)`;
  }
  $('pollBtns').addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    if (b.dataset.reset) votes = start.slice();
    else votes[Number(b.dataset.vote)]++;
    render();
  });
  render();
}

/* Project 3 — quiz scoring board */
const QUIZ = [
  { q: 'Shortcut that turns a range into a Table', o: ['Ctrl+B', 'Ctrl+T', 'Ctrl+K'], a: 1 },
  { q: 'Which function replaces VLOOKUP in Microsoft 365?', o: ['SUMIF', 'TRIM', 'XLOOKUP'], a: 2 },
  { q: 'Which function counts cells that meet a condition?', o: ['COUNTIF', 'COUNTA', 'ROUND'], a: 0 },
  { q: 'PMT returns the…', o: ['Total interest', 'Tax due', 'Periodic loan payment'], a: 2 },
  { q: 'A PivotTable is used to…', o: ['Encrypt a file', 'Summarise data quickly', 'Send email'], a: 1 }
];

function initQuiz() {
  const demo = $('quizDemo');
  if (!demo) return;
  const board = [];

  demo.innerHTML = `
    <div class="demo-title">LIVE DEMO — ANSWER THE QUESTIONS, THEN ADD YOUR SCORE TO THE BOARD</div>
    <div style="overflow-x:auto;"><table class="led">
      <tr><th>#</th><th>Question</th><th>Your answer</th><th></th></tr>
      ${QUIZ.map((q, i) => `<tr><td>${i + 1}</td><td>${q.q}</td>
        <td><select data-quiz="${i}"><option value="">—</option>${q.o.map((o, oi) => `<option value="${oi}">${o}</option>`).join('')}</select></td>
        <td data-quiz-mark="${i}"></td></tr>`).join('')}
    </table></div>
    <div class="kpis">
      <div class="kpi"><div class="v" id="qScore">0 / ${QUIZ.length}</div><div class="l">Score =SUMPRODUCT(--(answers=key))</div></div>
      <div class="kpi"><div class="v" id="qPct">0%</div><div class="l">Percentage</div></div>
      <div class="kpi"><div class="v" id="qGrade">—</div><div class="l">Grade</div></div>
    </div>
    <div style="display:flex; gap:8px; flex-wrap:wrap; align-items:center;">
      <input type="text" id="qName" placeholder="Your name" maxlength="30">
      <button class="btn primary" type="button" id="qAdd">Add to board</button>
      <button class="btn" type="button" id="qClear">Clear answers</button>
    </div>
    <div class="msg" id="qMsg"></div>
    <div id="qBoard"></div>`;

  function score() {
    let s = 0, answered = 0;
    QUIZ.forEach((q, i) => {
      const v = demo.querySelector(`[data-quiz="${i}"]`).value;
      const mark = demo.querySelector(`[data-quiz-mark="${i}"]`);
      if (v === '') { mark.textContent = ''; mark.className = ''; return; }
      answered++;
      const ok = Number(v) === q.a;
      if (ok) s++;
      mark.textContent = ok ? '✓' : '✗';
      mark.className = ok ? 'ok' : 'bad';
    });
    const pct = s / QUIZ.length;
    $('qScore').textContent = `${s} / ${QUIZ.length}`;
    $('qPct').textContent = Math.round(pct * 100) + '%';
    $('qGrade').textContent = answered === 0 ? '—' : pct >= 0.7 ? 'A' : pct >= 0.6 ? 'B' : pct >= 0.5 ? 'C' : 'Retake';
    return { s, answered };
  }

  function renderBoard() {
    if (!board.length) { $('qBoard').innerHTML = ''; return; }
    const sorted = board.slice().sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));
    $('qBoard').innerHTML = `<div class="code-label">Leaderboard — =SORTBY(tblResults, tblResults[Score], -1)</div>
      <table class="led"><tr><th class="num">Rank</th><th>Name</th><th class="num">Score</th></tr>
      ${sorted.map((r, i) => `<tr><td class="num">${i + 1}</td><td>${r.name.replace(/[<>&]/g, '')}</td><td class="num">${r.score} / ${QUIZ.length}</td></tr>`).join('')}</table>`;
  }

  demo.addEventListener('change', score);
  $('qAdd').addEventListener('click', () => {
    const name = $('qName').value.trim();
    const { s, answered } = score();
    const msg = $('qMsg');
    if (!name) { msg.textContent = 'Enter your name first.'; msg.className = 'msg bad'; return; }
    if (answered < QUIZ.length) { msg.textContent = 'Answer all questions before submitting.'; msg.className = 'msg bad'; return; }
    board.push({ name, score: s });
    $('qName').value = '';
    msg.textContent = 'Score added.'; msg.className = 'msg ok';
    renderBoard();
  });
  $('qClear').addEventListener('click', () => {
    QUIZ.forEach((_, i) => { demo.querySelector(`[data-quiz="${i}"]`).value = ''; });
    $('qMsg').textContent = '';
    score();
  });
  score();
}

/* Project 4 — clock */
function initClock() {
  const t = $('clockTime');
  if (!t) return;
  function tick() {
    const d = new Date();
    t.textContent = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    $('clockDate').textContent = d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  }
  tick();
  setInterval(tick, 1000);
}

/* Project 5 — entry form */
function initEntryForm() {
  const demo = $('formDemo');
  if (!demo) return;
  const today = new Date().toISOString().slice(0, 10);
  const cats = ['Sales', 'Rent', 'Utilities', 'Transport', 'Salaries'];
  const entries = [
    { date: today, name: 'Wanjiku Stores', cat: 'Sales', amt: 15000 },
    { date: today, name: 'Office landlord', cat: 'Rent', amt: 40000 },
    { date: today, name: 'Matatu fare', cat: 'Transport', amt: 600 }
  ];

  demo.innerHTML = `
    <div class="demo-title">LIVE DEMO — DATA ENTRY FORM THAT FEEDS A TABLE</div>
    <div class="demo-grid">
      <div class="field"><label for="fDate">Date</label><input type="date" id="fDate" value="${today}"></div>
      <div class="field"><label for="fName">Name / description</label><input type="text" id="fName" maxlength="40"></div>
      <div class="field"><label for="fCat">Category</label><select id="fCat">${cats.map((c) => `<option>${c}</option>`).join('')}</select></div>
      <div class="field"><label for="fAmt">Amount (KES)</label><input type="number" id="fAmt" min="0" step="any"></div>
    </div>
    <button class="btn primary" type="button" id="fSubmit">Submit entry</button>
    <div class="msg" id="fMsg"></div>
    <div class="two-col">
      <div style="overflow-x:auto;"><table class="led" id="fTable"></table></div>
      <div style="overflow-x:auto;"><table class="led" id="fSummary"></table></div>
    </div>`;

  const safe = (s) => String(s).replace(/[<>&"]/g, '');

  function render() {
    $('fTable').innerHTML = `<tr><th>Date</th><th>Name</th><th>Category</th><th class="num">Amount</th></tr>` +
      entries.map((e) => `<tr><td>${e.date}</td><td>${safe(e.name)}</td><td>${e.cat}</td><td class="num">${fmt2(e.amt)}</td></tr>`).join('');
    const rows = cats.map((c) => {
      const total = entries.filter((e) => e.cat === c).reduce((a, e) => a + e.amt, 0);
      return `<tr><td>${c}</td><td class="num">${fmt2(total)}</td><td class="left muted small">=SUMIF(tblEntries[Category],"${c}",tblEntries[Amount])</td></tr>`;
    }).join('');
    const all = entries.reduce((a, e) => a + e.amt, 0);
    $('fSummary').innerHTML = `<tr><th>Category</th><th class="num">Total</th><th>Formula</th></tr>${rows}
      <tr class="total"><td>All (${entries.length} entries)</td><td class="num">${fmt2(all)}</td><td class="left muted small">=SUM(tblEntries[Amount])</td></tr>`;
  }

  $('fSubmit').addEventListener('click', () => {
    const name = $('fName').value.trim();
    const amt = parseFloat($('fAmt').value);
    const msg = $('fMsg');
    if (!name) { msg.textContent = 'Enter a name or description.'; msg.className = 'msg bad'; return; }
    if (!isFinite(amt) || amt <= 0) { msg.textContent = 'Amount must be a positive number.'; msg.className = 'msg bad'; return; }
    entries.push({ date: $('fDate').value || today, name, cat: $('fCat').value, amt });
    $('fName').value = ''; $('fAmt').value = '';
    msg.textContent = 'Entry added to the table.'; msg.className = 'msg ok';
    render();
  });
  render();
}

/* Project 6 — loan schedule */
function loanSchedule(P, annual, n, method) {
  const rows = [];
  let bal = P;
  if (method === 'flat') {
    const totalInt = P * (annual / 100) * (n / 12);
    const pay = (P + totalInt) / n;
    const intM = totalInt / n;
    const prin = P / n;
    for (let i = 1; i <= n; i++) {
      const open = bal;
      bal = Math.max(0, bal - prin);
      rows.push({ i, open, pay, int: intM, prin, close: bal });
    }
    return { pay, rows, totalInt };
  }
  const r = annual / 100 / 12;
  const pay = r === 0 ? P / n : P * r / (1 - Math.pow(1 + r, -n));
  for (let i = 1; i <= n; i++) {
    const intr = bal * r;
    const prin = pay - intr;
    const close = Math.max(0, bal - prin);
    rows.push({ i, open: bal, pay, int: intr, prin, close });
    bal = close;
  }
  return { pay, rows, totalInt: rows.reduce((s, x) => s + x.int, 0) };
}

function initLoan() {
  const demo = $('loanDemo');
  if (!demo) return;
  let showAll = false;

  demo.innerHTML = `
    <div class="demo-title">LIVE DEMO — LOAN CALCULATOR AND REPAYMENT SCHEDULE</div>
    <div class="demo-grid">
      <div class="field"><label for="lP">Principal (KES)</label><input type="number" id="lP" value="500000" min="0" step="10000"></div>
      <div class="field"><label for="lR">Annual interest rate (%)</label><input type="number" id="lR" value="14" min="0" step="0.5"></div>
      <div class="field"><label for="lN">Months</label><input type="number" id="lN" value="24" min="1" max="360" step="1"></div>
      <div class="field"><label for="lM">Interest method</label>
        <select id="lM"><option value="reducing">Reducing balance</option><option value="flat">Flat rate</option></select></div>
    </div>
    <div class="kpis">
      <div class="kpi"><div class="v" id="lPay">0</div><div class="l">Monthly instalment</div></div>
      <div class="kpi"><div class="v" id="lInt">0</div><div class="l">Total interest</div></div>
      <div class="kpi"><div class="v" id="lTot">0</div><div class="l">Total repayment</div></div>
    </div>
    <div class="msg" id="lMsg"></div>
    <div style="overflow-x:auto;"><table class="led" id="lTable"></table></div>
    <button class="btn" type="button" id="lToggle">Show full schedule</button>`;

  function render() {
    const P = num($('lP').value), a = num($('lR').value), n = Math.round(num($('lN').value));
    const msg = $('lMsg');
    if (P <= 0 || n < 1 || n > 360 || a < 0) {
      msg.textContent = 'Enter a principal above 0, a rate of 0 or more, and 1 to 360 months.'; msg.className = 'msg bad';
      $('lTable').innerHTML = '';
      return;
    }
    msg.textContent = ''; msg.className = 'msg';
    const s = loanSchedule(P, a, n, $('lM').value);
    $('lPay').textContent = fmt(s.pay);
    $('lInt').textContent = fmt(s.totalInt);
    $('lTot').textContent = fmt(P + s.totalInt);
    const shown = showAll ? s.rows : s.rows.slice(0, 12);
    $('lTable').innerHTML = `<tr><th class="num">#</th><th class="num">Opening</th><th class="num">Instalment</th><th class="num">Interest</th><th class="num">Principal</th><th class="num">Closing</th></tr>` +
      shown.map((r) => `<tr><td class="num">${r.i}</td><td class="num">${fmt(r.open)}</td><td class="num">${fmt(r.pay)}</td><td class="num">${fmt(r.int)}</td><td class="num">${fmt(r.prin)}</td><td class="num">${fmt(r.close)}</td></tr>`).join('');
    $('lToggle').textContent = showAll ? 'Show first 12 months' : `Show full schedule (${s.rows.length} months)`;
    $('lToggle').style.display = s.rows.length > 12 ? '' : 'none';
  }
  demo.addEventListener('input', render);
  demo.addEventListener('change', render);
  $('lToggle').addEventListener('click', () => { showAll = !showAll; render(); });
  render();
}

/* Project 7 — database search and dependent dropdown */
const DB_ROWS = [
  ['CL0001', 'Wanjiku Traders', 'Nairobi', 'Westlands', 'Active', 45000],
  ['CL0002', 'Otieno Hardware', 'Kisumu', 'Kondele', 'Active', 120000],
  ['CL0003', 'Mwangi Supplies', 'Nakuru', 'Lanet', 'Overdue', 78500],
  ['CL0004', 'Coastal Fresh Ltd', 'Mombasa', 'Nyali', 'Active', 0],
  ['CL0005', 'Achieng Fabrics', 'Kisumu', 'Milimani', 'Overdue', 32000],
  ['CL0006', 'Kamau and Sons', 'Nairobi', 'Embakasi', 'Closed', 0],
  ['CL0007', 'Baraka Logistics', 'Mombasa', 'Changamwe', 'Active', 210000],
  ['CL0008', 'Njeri Boutique', 'Nairobi', 'Kasarani', 'Overdue', 18750]
];
const TOWNS = {
  Nairobi: ['Westlands', 'Kasarani', 'Embakasi'],
  Mombasa: ['Nyali', 'Likoni', 'Changamwe'],
  Kisumu: ['Milimani', 'Kondele', 'Nyalenda'],
  Nakuru: ['Section 58', 'Lanet', 'Bahati']
};

function initDatabase() {
  const demo = $('dbDemo');
  if (!demo) return;
  const counties = Object.keys(TOWNS);

  demo.innerHTML = `
    <div class="demo-title">LIVE DEMO — SEARCH, FILTER AND DEPENDENT DROPDOWN</div>
    <div class="demo-grid">
      <div class="field"><label for="dbQ">Search name</label><input type="text" id="dbQ" placeholder="e.g. trad"></div>
      <div class="field"><label for="dbS">Status</label>
        <select id="dbS"><option>All</option><option>Active</option><option>Overdue</option><option>Closed</option></select></div>
      <div class="field"><label for="dbC">County</label>
        <select id="dbC"><option>All</option>${counties.map((c) => `<option>${c}</option>`).join('')}</select></div>
    </div>
    <div style="overflow-x:auto;"><table class="led" id="dbTable"></table></div>
    <div class="msg muted" id="dbCount"></div>
    <div class="demo-title" style="margin-top:14px;">DEPENDENT DROPDOWN — PICK A COUNTY, THEN A TOWN</div>
    <div class="demo-grid">
      <div class="field"><label for="ddC">County</label>
        <select id="ddC"><option value="">— choose —</option>${counties.map((c) => `<option>${c}</option>`).join('')}</select></div>
      <div class="field"><label for="ddT">Town</label><select id="ddT" disabled><option>— choose county first —</option></select></div>
    </div>`;

  function render() {
    const q = $('dbQ').value.trim().toLowerCase();
    const st = $('dbS').value, co = $('dbC').value;
    const rows = DB_ROWS.filter((r) =>
      (!q || r[1].toLowerCase().includes(q)) && (st === 'All' || r[4] === st) && (co === 'All' || r[2] === co));
    $('dbTable').innerHTML = `<tr><th>ID</th><th>Name</th><th>County</th><th>Town</th><th>Status</th><th class="num">Balance</th></tr>` +
      (rows.length
        ? rows.map((r) => `<tr><td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td><td>${r[3]}</td><td>${r[4]}</td><td class="num">${fmt(r[5])}</td></tr>`).join('')
        : `<tr><td colspan="6" class="muted">No match</td></tr>`);
    const bal = rows.reduce((a, r) => a + r[5], 0);
    $('dbCount').textContent = `Showing ${rows.length} of ${DB_ROWS.length} records · balance KES ${fmt(bal)}  (=ROWS(result) and =SUM of the Balance column)`;
  }
  ['dbQ', 'dbS', 'dbC'].forEach((id) => $(id).addEventListener('input', render));

  $('ddC').addEventListener('change', () => {
    const c = $('ddC').value;
    const t = $('ddT');
    if (!c) { t.disabled = true; t.innerHTML = '<option>— choose county first —</option>'; return; }
    t.disabled = false;
    t.innerHTML = TOWNS[c].map((x) => `<option>${x}</option>`).join('');
  });
  render();
}

/* Financial analysis — ratio calculator */
const RATIO_INPUTS = [
  ['ca', 'Current assets', 1200000], ['inv', 'Inventory', 300000], ['cl', 'Current liabilities', 800000],
  ['rev', 'Revenue', 5000000], ['cogs', 'Cost of sales', 3200000], ['np', 'Net profit', 450000],
  ['ar', 'Receivables', 600000], ['ap', 'Payables', 500000], ['eq', 'Equity', 2500000]
];
const RATIOS = [
  ['Current ratio', '=B2/B4', (v) => v.ca / v.cl, 'x'],
  ['Quick ratio', '=(B2-B3)/B4', (v) => (v.ca - v.inv) / v.cl, 'x'],
  ['Gross margin', '=(B5-B6)/B5', (v) => (v.rev - v.cogs) / v.rev, '%'],
  ['Net margin', '=B7/B5', (v) => v.np / v.rev, '%'],
  ['Return on equity', '=B7/B10', (v) => v.np / v.eq, '%'],
  ['Debtor days', '=B8/B5*365', (v) => v.ar / v.rev * 365, 'd'],
  ['Creditor days', '=B9/B6*365', (v) => v.ap / v.cogs * 365, 'd'],
  ['Inventory days', '=B3/B6*365', (v) => v.inv / v.cogs * 365, 'd']
];

function initRatios() {
  const demo = $('ratioDemo');
  if (!demo) return;
  demo.innerHTML = `
    <div class="demo-title">LIVE DEMO — FINANCIAL RATIO CALCULATOR (KES)</div>
    <div class="demo-grid">
      ${RATIO_INPUTS.map((r, i) => `<div class="field"><label for="rt-${r[0]}">B${i + 2} · ${r[1]}</label>
        <input type="number" id="rt-${r[0]}" value="${r[2]}" min="0" step="10000"></div>`).join('')}
    </div>
    <div style="overflow-x:auto;"><table class="led" id="ratioTable"></table></div>`;

  function calc() {
    const v = {};
    RATIO_INPUTS.forEach((r) => { v[r[0]] = num($('rt-' + r[0]).value); });
    $('ratioTable').innerHTML = `<tr><th>Ratio</th><th class="num">Result</th><th>Excel formula</th></tr>` +
      RATIOS.map((r) => {
        const x = r[2](v);
        let out = '—';
        if (isFinite(x)) out = r[3] === 'x' ? x.toFixed(2) + 'x' : r[3] === '%' ? (x * 100).toFixed(1) + '%' : Math.round(x) + ' days';
        return `<tr><td>${r[0]}</td><td class="num">${out}</td><td class="left"><code class="f">${r[1]}</code></td></tr>`;
      }).join('');
  }
  demo.addEventListener('input', calc);
  calc();
}

/* ---------- Notes and progress tracker ---------- */
const NOTES_KEY = 'kenya-ledger-notes';
const STATUS_LABELS = { none: 'Not started', learning: 'In progress', review: 'Needs revision', done: 'Completed' };
let notesData = {};
let notesTimer = null;

const escHtml = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const paneTitle = (id) => {
  const b = document.querySelector(`nav.tabs button[data-pane="${id}"]`);
  return b ? b.textContent.trim() : id;
};
const trackedPanes = () => Array.from(document.querySelectorAll('nav.tabs button[data-pane]'))
  .map((b) => b.dataset.pane).filter((id) => id !== 'settings' && id !== 'progress');
const fmtWhen = (ts) => new Date(ts).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' });

function saveNotesSoon() {
  clearTimeout(notesTimer);
  notesTimer = setTimeout(() => store.set(NOTES_KEY, JSON.stringify(notesData)), 400);
}

function renderProgress() {
  const ids = trackedPanes();
  const done = ids.filter((id) => (notesData[id] || {}).status === 'done').length;
  $('notesLabel').textContent = `${done} / ${ids.length} modules completed`;
  $('notesFill').style.width = ids.length ? `${(done / ids.length * 100).toFixed(0)}%` : '0%';
  $('progressTable').innerHTML =
    `<tr><th>Module</th><th>Status</th><th>Last updated</th><th>My notes</th></tr>` +
    ids.map((id) => {
      const n = notesData[id] || {};
      const st = n.status || 'none';
      const text = (n.text || '').trim().replace(/\s+/g, ' ');
      const excerpt = text ? escHtml(text.length > 110 ? text.slice(0, 110) + '…' : text) : '<span class="muted">No notes yet</span>';
      return `<tr><td><button class="link" type="button" data-open="${id}">${escHtml(paneTitle(id))}</button></td>
        <td><span class="status-chip ${st}">${STATUS_LABELS[st]}</span></td>
        <td class="small muted">${n.updated ? fmtWhen(n.updated) : '—'}</td>
        <td class="note-excerpt">${excerpt}</td></tr>`;
    }).join('');
}

async function initNotes() {
  try {
    const raw = await store.get(NOTES_KEY);
    notesData = raw ? JSON.parse(raw) : {};
  } catch (e) { notesData = {}; }

  trackedPanes().forEach((id) => {
    const pane = $(id);
    if (!pane) return;
    const n = notesData[id] || {};
    const card = document.createElement('div');
    card.className = 'card notes-card';
    card.innerHTML = `
      <h3>My notes — ${escHtml(paneTitle(id))}</h3>
      <div class="notes-row">
        <label>Status
          <select>${Object.keys(STATUS_LABELS).map((k) => `<option value="${k}">${STATUS_LABELS[k]}</option>`).join('')}</select>
        </label>
        <span class="notes-saved">${n.updated ? 'Saved ' + fmtWhen(n.updated) : ''}</span>
      </div>
      <textarea placeholder="Write what you learned in this module, questions to revisit, and what to practise next…"></textarea>`;
    const sel = card.querySelector('select'), ta = card.querySelector('textarea'), saved = card.querySelector('.notes-saved');
    sel.value = n.status || 'none';
    ta.value = n.text || '';

    const update = () => {
      notesData[id] = { text: ta.value, status: sel.value, updated: Date.now() };
      saved.textContent = 'Saved ' + fmtWhen(notesData[id].updated);
      saveNotesSoon();
      renderProgress();
    };
    ta.addEventListener('input', update);
    sel.addEventListener('change', update);
    pane.appendChild(card);
  });

  $('progressTable').addEventListener('click', (e) => {
    const b = e.target.closest('button[data-open]');
    if (b) showPane(b.dataset.open);
  });
  $('notesDownload').addEventListener('click', () => {
    const out = ['THE LEDGER — MY NOTES', 'Exported ' + fmtWhen(Date.now()), ''];
    trackedPanes().forEach((id) => {
      const n = notesData[id] || {};
      out.push('== ' + paneTitle(id) + ' ==', 'Status: ' + STATUS_LABELS[n.status || 'none'], (n.text || '(no notes)').trim(), '');
    });
    const url = URL.createObjectURL(new Blob([out.join('\n')], { type: 'text/plain' }));
    const a = document.createElement('a');
    a.href = url; a.download = 'my-ledger-notes.txt';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
  renderProgress();
}

/* ---------- Settings: font, text size, page width ---------- */
const SETTINGS_KEY = 'kenya-ledger-settings';
const FONT_STACKS = {
  inter: ['Inter', 'Inter, "Segoe UI", system-ui, -apple-system, Roboto, sans-serif'],
  roboto: ['Roboto', 'Roboto, "Segoe UI", Arial, sans-serif'],
  opensans: ['Open Sans', '"Open Sans", "Segoe UI", Arial, sans-serif'],
  lato: ['Lato', 'Lato, "Segoe UI", Arial, sans-serif'],
  poppins: ['Poppins', 'Poppins, "Segoe UI", Arial, sans-serif'],
  montserrat: ['Montserrat', 'Montserrat, "Segoe UI", Arial, sans-serif'],
  nunito: ['Nunito', 'Nunito, "Segoe UI", Arial, sans-serif'],
  sourcesans: ['Source Sans 3', '"Source Sans 3", "Segoe UI", Arial, sans-serif'],
  worksans: ['Work Sans', '"Work Sans", "Segoe UI", Arial, sans-serif'],
  dmsans: ['DM Sans', '"DM Sans", "Segoe UI", Arial, sans-serif'],
  plexsans: ['IBM Plex Sans', '"IBM Plex Sans", "Segoe UI", Arial, sans-serif'],
  firasans: ['Fira Sans', '"Fira Sans", "Segoe UI", Arial, sans-serif'],
  merriweather: ['Merriweather', 'Merriweather, Georgia, serif'],
  lora: ['Lora', 'Lora, Georgia, serif'],
  playfair: ['Playfair Display', '"Playfair Display", Georgia, serif'],
  sourceserif: ['Source Serif 4', '"Source Serif 4", Georgia, serif'],
  jetbrains: ['JetBrains Mono', '"JetBrains Mono", Consolas, Menlo, monospace'],
  plexmono: ['IBM Plex Mono', '"IBM Plex Mono", Consolas, Menlo, monospace'],
  cambria: ['Cambria', 'Cambria, Georgia, "Times New Roman", serif'],
  georgia: ['Georgia', 'Georgia, "Times New Roman", serif'],
  times: ['Times New Roman', '"Times New Roman", Times, serif'],
  arial: ['Arial', 'Arial, Helvetica, sans-serif'],
  verdana: ['Verdana', 'Verdana, Geneva, sans-serif'],
  segoe: ['Segoe UI', '"Segoe UI", Tahoma, Arial, sans-serif'],
  calibri: ['Calibri', 'Calibri, Candara, "Segoe UI", sans-serif'],
  trebuchet: ['Trebuchet MS', '"Trebuchet MS", Tahoma, sans-serif'],
  system: ['System default', 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif'],
  mono: ['Monospace', 'Consolas, Menlo, "Courier New", monospace']
};
const DEFAULT_SETTINGS = { font: 'cambria', size: 100, width: 'full' };
let settings = Object.assign({}, DEFAULT_SETTINGS);

function applySettings() {
  const stack = (FONT_STACKS[settings.font] || FONT_STACKS.cambria)[1];
  document.documentElement.style.setProperty('--font', stack);
  document.documentElement.style.setProperty('--scale', String(settings.size / 100));
  document.body.classList.toggle('narrow', settings.width === 'narrow');
  const f = $('setFont'), s = $('setSize'), w = $('setWidth');
  if (f) f.value = settings.font;
  if (s) s.value = settings.size;
  if (w) w.value = settings.width;
  if ($('setSizeVal')) $('setSizeVal').textContent = settings.size + '%';
}

async function initSettings() {
  const fontSel = $('setFont');
  if (!fontSel) return;
  fontSel.innerHTML = Object.keys(FONT_STACKS).map((k) =>
    `<option value="${k}" style="font-family:${FONT_STACKS[k][1].replace(/"/g, "'")}">${FONT_STACKS[k][0]}</option>`).join('');

  try {
    const raw = await store.get(SETTINGS_KEY);
    if (raw) {
      const saved = JSON.parse(raw);
      if (FONT_STACKS[saved.font]) settings.font = saved.font;
      if (saved.size >= 80 && saved.size <= 150) settings.size = Number(saved.size);
      if (saved.width === 'full' || saved.width === 'narrow') settings.width = saved.width;
    }
  } catch (e) { /* keep defaults */ }
  applySettings();

  const save = () => { applySettings(); return store.set(SETTINGS_KEY, JSON.stringify(settings)); };
  fontSel.addEventListener('change', () => { settings.font = fontSel.value; save(); });
  $('setSize').addEventListener('input', (e) => { settings.size = Number(e.target.value); save(); });
  $('setWidth').addEventListener('change', (e) => { settings.width = e.target.value; save(); });
  $('setReset').addEventListener('click', () => { settings = Object.assign({}, DEFAULT_SETTINGS); save(); });
}

/* ---------- 5. Start-up ---------- */
(async function init() {
  initTabs();
  await initSettings();

  progress = await loadState(SCHEDULE_KEY);
  analystProgress = await loadState(ANALYST_KEY);

  createTracker({
    mount: 'weekList', data: scheduleData, state: progress, storageKey: SCHEDULE_KEY,
    groupName: 'Week', labelId: 'progressLabel', fillId: 'progressFill'
  });
  createTracker({
    mount: 'analystList', data: analystData, state: analystProgress, storageKey: ANALYST_KEY,
    groupName: 'Phase', labelId: 'analystLabel', fillId: 'analystFill'
  });

  renderPayrollSteps();
  renderPayrollCalc();
  const grossInput = $('grossPayInput');
  if (grossInput) grossInput.addEventListener('input', renderPayrollCalc);

  initMall();
  initGrades();
  initPoll();
  initQuiz();
  initClock();
  initEntryForm();
  initLoan();
  initDatabase();
  initRatios();
  await initNotes();

  const saved = await store.get(THEME_KEY);
  applyTheme(saved === 'dark' ? 'dark' : 'light');
  $('themeToggle').addEventListener('click', async () => {
    const next = document.body.classList.contains('dark') ? 'light' : 'dark';
    applyTheme(next);
    await store.set(THEME_KEY, next);
  });
})();
