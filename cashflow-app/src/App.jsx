import { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

import ProjectSetup from './ProjectSetup.jsx';
import Welcome from './Welcome.jsx';
import Overview from './Overview.jsx';
import ProfileSettings from './ProfileSettings.jsx';
import { api } from './api.js';

const translations = {
  fi: {
    // General
    title: 'Kassavirtalaskuri',
    language: 'Kieli',
    english: 'English',
    finnish: 'Suomi',
    newProject: 'Uusi projekti',
    back: 'Takaisin',
    skip: 'Ohita',
    next: 'Seuraava',
    finish: 'Valmis',
    edit: 'Muokkaa',
    cancel: 'Peruuta',
    save: 'Tallenna',
    // Project Manager
    yourProjects: 'Projektisi',
    lastUpdated: 'Viimeksi päivitetty',
    deleteProject: 'Poista projekti',
    confirmDelete: (name) => `Haluatko varmasti poistaa projektin <strong>${name}</strong>?`,
    actionCannotBeUndone: 'Tätä toimintoa ei voi kumota.',
    changeProject: 'Vaihda projekti',
    profileSettings: 'Profiiliasetukset',
    name: 'Nimi',
    email: 'Sähköposti',
    password: 'Salasana',
    saveChanges: 'Tallenna muutokset',
    migrateEmailWarning: 'Sähköpostin vaihtaminen siirtää projektisi uuteen osoitteeseen.',
    fillAllFields: 'Täytä kaikki kentät',
    passwordTooShort: 'Salasanan tulee olla vähintään 8 merkkiä pitkä.',
    passwordsDoNotMatch: 'Salasanat eivät täsmää.',
    forgotPassword: 'Unohtuiko salasana?',
    resetPassword: 'Nollaa salasana',
    sendResetLink: 'Lähetä nollauslinkki',
    backToLogin: 'Takaisin kirjautumiseen',
    enterEmailReset: 'Syötä sähköpostisi nollataksesi salasanan',
    enterEmail: 'Syötä sähköpostiosoite',
    resetLinkSent: (email) => `Salasanan nollauslinkki lähetetty osoitteeseen ${email}`,
    deleteAccount: 'Poista tili',
    confirmAccountDelete: (email) => `Haluatko varmasti poistaa tilin <strong>${email}</strong>?`,
    deleteAccountWarning: 'Tämä poistaa kaikki projektisi ja tilisi. Tätä toimintoa ei voi kumota.',
    upgradeToCreateMore: 'Päivitä Premiumiin luodaksesi lisää projekteja',
    upgradeForAdvanced: 'Päivitä Premiumiin saadaksesi edistyneet ennusteskenaariot!',
    upgradeToExport: 'Päivitä Premiumiin viedäksesi tietoja CSV-muodossa.',
    export: 'Vie',
    features: 'Ominaisuudet',
    comingSoonTitle: 'Tulossa pian!',
    comingSoonMessage: (feature) => `Ominaisuus "${feature}" on rakenteilla.`,
    upgradeForFeature: 'Tämä on premium-ominaisuus. Päivitä käyttääksesi sitä.',

    // Dashboard inputs
    inputs: 'Syötteet',
    easyTab: 'Yksinkertainen',
    advancedTab: 'Laajennettu',
    cashBalance: 'Nykyinen kassa',
    monthlyRevenue: 'Kuukausittainen liikevaihto',
    fixedCosts: 'Kiinteät kulut / kk',
    variableCosts: 'Muuttuvat kulut / kk',
    revenueGrowth: 'Liikevaihdon kasvu (%)',
    unitsSold: 'Myydyt yksiköt / kk',
    pricePerUnit: 'Myyntihinta / yksikkö',
    costPerUnit: 'Kustannus / yksikkö',
    oneTimeRevenue: 'Kertaluonteinen tulo',
    oneTimeCost: 'Kertaluonteinen meno',
    // Dashboard Advanced Inputs
    oneTimeEvents: 'Kertaluonteiset tapahtumat (seuraava kk)',
    income: 'Tulot',
    recurringCosts: 'Toistuvat kulut',
    assumptions: 'Oletukset',

    // Dashboard results
    results: 'Ennuste',
    predictionTab: 'Ennuste',
    breakEvenTab: 'Nollakohta',
    cashFlowForecast: 'Kassavirtaennuste',
    cashBalanceLabel: 'Kassa',

    // Status messages
    status: 'Tila',
    statusPositive: 'Tilanne on hyvä. Kassavirtasi on positiivinen.',
    statusWarning: (months) => `Varoitus: Kassavirtasi on negatiivinen. Nykyisellä menolla rahasi riittävät arviolta ${months} kuukautta.`,
    statusDanger: (months) => `Vaara: Rahasi ovat loppumassa! Nykyisellä menolla rahasi riittävät alle ${months} kuukautta.`,

    // Break-even tab
    breakEvenRevenue: 'Nollatulosliikevaihto',
    breakEvenUnits: 'Nollatulosyksiköt',
    currentRevenue: 'Nykyinen liikevaihto',
    salesGap: 'Myyntivaje',
    safetyMargin: 'Turvamarginaali',
    moreToSell: 'Myytävä lisää',
    aboveBreakEven: 'Yli nollatuloksen',
    unitsLabel: 'kpl',

    // Welcome page
    welcome: {
      title: 'Tervetuloa',
      subtitle: 'Mitä haluat tehdä?',
      own: 'Olemassa olevasta yrityksestä',
      start: 'Uudesta yritysideasta',
      howToCreate: 'Miten haluat luoda projektisi?',
      loadProject: 'Lataa projekti',
      requestDemo: 'Pyydä demo',
      heroTitle: 'Ymmärrä kassavirtasi, heti.',
      heroSubtitle: 'Yksinkertaisin tapa pienyrittäjille ennakoida talouttaan, löytää nollapiste ja tehdä päätöksiä luottavaisin mielin.',
      pricingTitle: 'Yksinkertainen, läpinäkyvä hinnoittelu',
      pricingSubtitle: 'Valitse yrityksellesi sopiva paketti.',
      free: 'Ilmainen',
      freeDesc: 'Yksityishenkilöille ja aloittaville yrittäjille.',
      freeFeature1: 'Peruskassavirtaennuste',
      freeFeature2: '1 projekti',
      freeFeature3: 'Nollakohta-analyysi',
      freeFeature4: 'Yhteisön tuki',
      getStartedFree: 'Aloita ilmaiseksi',
      premium: 'Premium',
      mostPopular: 'Suosituin',
      perMonth: '/kk',
      annualPrice: (price) => `tai ${price} / vuosi`,
      save: (percent) => `Säästä ${percent}%`,
      premiumDesc: 'Kasvaville yrityksille, jotka tarvitsevat enemmän tehoa ja rajattomasti projekteja.',
      premiumFeature1: 'Kaikki ilmaisversiossa, ja lisäksi:',
      premiumFeature2: 'Rajattomasti projekteja',
      premiumFeature3: 'Edistyneet ennusteskenaariot',
      premiumFeature4: 'Tietojen vienti (CSV, PDF)',
      premiumFeature5: 'Ensisijainen tuki',
      premiumFeature6: 'Rajoittamaton tulot ja kulut',
      premiumFeature7: 'laskut',
      premiumFeature8: 'Hallitse asiakkaita',
      premiumFeature9: 'Täsmäytä pankkitilit',
      premiumFeature10: 'Valmistele ALV- ja veroilmoitukset',
      premiumFeature11: 'Rajoittamaton työntekijöiden palkanlaskenta',
      premiumFeature12: 'Seuraa varastoa',
      premiumFeature13: 'Hallitse toimittajia',
      premiumFeature14: 'Hallitse omaisuutta ja lainoja',
      upgradeToPremium: 'Päivitä Premiumiin',
      discountCode: 'Alennuskoodi',
      redeem: 'Lunasta',
      codeSuccess: 'Koodi lunastettu onnistuneesti!',
      codeInvalid: 'Virheellinen alennuskoodi.',
      premiumActivated: 'Premium aktivoitu',
      trustedBy: 'Sinun kaltaistesi yritysten luottama',
      // for question flow
      existing: {
        name: 'Yrityksen nimi',
        cash: 'Nykyinen kassa',
        monthlyRevenue: 'Kuukausittainen liikevaihto',
        fixedCosts: 'Kiinteät kulut / kk',
        profitPerItem: 'Voitto / tuote',
        unitsPerMonth: 'Arvioidut yksiköt / kk',
      },
      startup: {
        name: 'Yrityksen nimi',
        logo: 'Logon URL',
        monthlyFixedCosts: 'Kuukausittaiset kiinteät kulut',
        profitPerItem: 'Voitto / tuote',
      },
      error: {
        nameEmpty: 'Projektin nimi ei voi olla tyhjä.',
        nameExists: 'Tämänniminen projekti on jo olemassa. Valitse toinen nimi.',
      },
    },

    // Overview page
    overview: {
      title: 'Yhteenveto',
      continue: 'Jatka sovellukseen',
      confirmDetails: 'Vahvista projektisi tiedot alla. Voit muuttaa näitä numeroita myöhemmin.',
      sections: {
        name: 'Projektin nimi',
        initialCash: 'Alkukassa',
        monthlyRevenue: 'Kuukausittainen liikevaihto',
        fixedCosts: 'Kuukausittaiset kiinteät kulut',
        profitPerItem: 'Voitto / tuote',
        unitsPerMonth: 'Arvioidut yksiköt / kk',
      },
    },
  },
  en: {
    // General
    title: 'Cash Flow Calculator',
    language: 'Language',
    english: 'English',
    finnish: 'Suomi',
    newProject: 'New Project',
    back: 'Back',
    skip: 'Skip',
    next: 'Next',
    finish: 'Finish',
    edit: 'Edit',
    cancel: 'Cancel',
    save: 'Save',
    later: 'Later',
    // Project Manager
    yourProjects: 'Your Projects',
    lastUpdated: 'Last updated',
    deleteProject: 'Delete Project',
    confirmDelete: (name) => `Are you sure you want to delete <strong>${name}</strong>?`,
    actionCannotBeUndone: 'This action cannot be undone.',
    changeProject: 'Change Project',
    profileSettings: 'Profile Settings',
    name: 'Name',
    email: 'Email',
    password: 'Password',
    saveChanges: 'Save Changes',
    migrateEmailWarning: 'Changing your email will migrate your projects to the new address.',
    fillAllFields: 'Please fill in all fields',
    passwordTooShort: 'Password must be at least 8 characters long.',
    passwordsDoNotMatch: 'Passwords do not match.',
    forgotPassword: 'Forgot Password?',
    resetPassword: 'Reset Password',
    sendResetLink: 'Send Reset Link',
    backToLogin: 'Back to Log In',
    enterEmailReset: 'Enter your email to reset password',
    enterEmail: 'Please enter your email address',
    resetLinkSent: (email) => `Password reset link sent to ${email}`,
    deleteAccount: 'Delete Account',
    confirmAccountDelete: (email) => `Are you sure you want to delete account <strong>${email}</strong>?`,
    deleteAccountWarning: 'This will delete all your projects and your account. This action cannot be undone.',
    upgradeToCreateMore: 'Upgrade to Premium to create more projects',
    upgradeForAdvanced: 'Upgrade to Premium for advanced forecasting scenarios!',
    upgradeToExport: 'Upgrade to Premium to export data as CSV.',
    export: 'Export',
    features: 'Features',
    comingSoonTitle: 'Coming Soon!',
    comingSoonMessage: (feature) => `The "${feature}" feature is under construction.`,
    upgradeForFeature: 'This is a premium feature. Please upgrade to use it.',

    // Dashboard inputs
    inputs: 'Inputs',
    easyTab: 'Easy',
    advancedTab: 'Advanced',
    cashBalance: 'Current Cash Balance',
    monthlyRevenue: 'Monthly Revenue',
    fixedCosts: 'Monthly Fixed Costs',
    variableCosts: 'Monthly Variable Costs',
    revenueGrowth: 'Revenue Growth (%)',
    unitsSold: 'Units Sold / month',
    pricePerUnit: 'Price per Unit',
    costPerUnit: 'Cost per Unit',
    oneTimeRevenue: 'One-Time Revenue',
    oneTimeCost: 'One-Time Cost',
    // Dashboard Advanced Inputs
    oneTimeEvents: 'One-Time Events (in next month)',
    income: 'Income',
    recurringCosts: 'Recurring Costs',
    assumptions: 'Assumptions',

    // Dashboard results
    results: 'Forecast',
    predictionTab: 'Prediction',
    breakEvenTab: 'Break-even',
    cashFlowForecast: 'Cash Flow Forecast',
    cashBalanceLabel: 'Cash Balance',

    // Status messages
    status: 'Status',
    statusPositive: 'Your cash flow is positive. Things are looking good.',
    statusWarning: (months) => `Warning: Your cash flow is negative. At the current rate, your cash will last for approximately ${months} months.`,
    statusDanger: (months) => `Danger: You are running out of cash! At the current rate, your cash will last for less than ${months} months.`,

    // Break-even tab
    breakEvenRevenue: 'Break-Even Revenue',
    breakEvenUnits: 'Break-Even Units',
    currentRevenue: 'Current Revenue',
    salesGap: 'Sales Gap',
    safetyMargin: 'Safety Margin',
    moreToSell: 'Need to sell',
    aboveBreakEven: 'Above break-even',
    unitsLabel: 'units',

    // Welcome page
    welcome: {
      title: 'Welcome',
      subtitle: 'What would you like to do?',
      own: 'From an Existing Business',
      start: 'From a New Business Idea',
      howToCreate: 'How would you like to create your project?',
      loadProject: 'Load Project',
      requestDemo: 'Request a Demo',
      heroTitle: 'Understand your cash flow, instantly.',
      heroSubtitle: 'The simplest way for small business owners to forecast their finances, find their break-even point, and make decisions with confidence.',
      pricingTitle: 'Simple, transparent pricing',
      pricingSubtitle: 'Choose the plan that\'s right for your business.',
      free: 'Free',
      freeDesc: 'For individuals and startups getting started with their finances.',
      freeFeature1: 'Basic cash flow forecasting',
      freeFeature2: '1 Project',
      freeFeature3: 'Break-even analysis',
      freeFeature4: 'Community support',
      getStartedFree: 'Get Started for Free',
      premium: 'Premium',
      mostPopular: 'Most Popular',
      perMonth: '/month',
      annualPrice: (price) => `or ${price} / year`,
      save: (percent) => `Save ${percent}%`,
      premiumDesc: 'For growing businesses that need more power and unlimited projects.',
      premiumFeature1: 'Everything in Free, plus:',
      premiumFeature2: 'Unlimited Projects',
      premiumFeature3: 'Advanced forecasting scenarios',
      premiumFeature4: 'Data export (CSV, PDF)',
      premiumFeature5: 'Priority support',
      premiumFeature6: 'Unlimited Income & Expenses',
      premiumFeature7: 'Invoices',
      premiumFeature8: 'Manage Customers',
      premiumFeature9: 'Reconcile Bank Accounts',
      premiumFeature10: 'Prepare BAS & Tax Reports',
      premiumFeature11: 'Unlimited Employees Single Touch Payroll',
      premiumFeature12: 'Track Inventory',
      premiumFeature13: 'Manage Suppliers',
      premiumFeature14: 'Manage Assets & Loans',
      upgradeToPremium: 'Upgrade to Premium',
      discountCode: 'Discount code',
      redeem: 'Redeem',
      codeSuccess: 'Code redeemed successfully!',
      codeInvalid: 'Invalid discount code.',
      premiumActivated: 'Premium Activated',
      trustedBy: 'Trusted by businesses like yours',
      // for question flow
      existing: {
        name: 'Business name',
        cash: 'Current cash',
        monthlyRevenue: 'Monthly revenue',
        fixedCosts: 'Fixed costs / month',
        profitPerItem: 'Profit per item',
        unitsPerMonth: 'Estimated units / month',
      },
      startup: {
        name: 'Business name',
        logo: 'Logo URL',
        monthlyFixedCosts: 'Monthly fixed costs',
        profitPerItem: 'Profit per item',
      },
      error: {
        nameEmpty: 'Project name cannot be empty.',
        nameExists: 'A project with this name already exists. Please choose another.',
      },
    },

    // Overview page
    overview: {
      title: 'Overview',
      continue: 'Continue to app',
      confirmDetails: 'Confirm your project details below. You can change these numbers later.',
      sections: {
        name: 'Project name',
        initialCash: 'Starting cash',
        monthlyRevenue: 'Monthly revenue',
        fixedCosts: 'Monthly fixed costs',
        profitPerItem: 'Profit per item',
        unitsPerMonth: 'Estimated units / month',
      },
    },
  },
};

const StatusMessage = ({ projection, cashBalance, language }) => {
  const t = translations[language];
 

  const monthlyProfit = projection.length > 0 ? projection[0] - cashBalance : 0;

  let variant = 'success';
  let message = t.statusPositive;

  if (monthlyProfit > 0) {
    variant = 'success';
    message = t.statusPositive;
  } else {
    const monthsToZero = projection.findIndex(p => p <= 0);
    if (monthsToZero === -1) {
      const lastMonthBalance = projection.length > 0 ? projection[projection.length - 1] : 0;
      const monthsLeft = monthlyProfit !== 0 ? Math.floor(lastMonthBalance / Math.abs(monthlyProfit)) : Infinity;
      variant = 'warning';
      message = t.statusWarning(monthsLeft);
    } else if (monthsToZero < 3) {
      variant = 'danger';
      message = t.statusDanger(monthsToZero + 1);
    } else {
      variant = 'warning';
      message = t.statusWarning(monthsToZero + 1);
    }
  }

  return (
    <div className={`alert alert-${variant} border-0 shadow-sm d-flex align-items-center`} role="alert">
      <div className="fw-medium">{message}</div>
    </div>
  );
};


function App() {
  const [language, setLanguage] = useState(() => {
    try {
      return localStorage.getItem('language') || 'en';
    } catch {
      return 'en';
    }
  });
  const t = translations[language];
  const [cashBalance, setCashBalance] = useState(10000);
  const [monthlyRevenue, setMonthlyRevenue] = useState(5000);
  const [fixedCosts, setFixedCosts] = useState(2000);
  const [variableCosts, setVariableCosts] = useState(1500);
  const [revenueGrowth, setRevenueGrowth] = useState(0);
  const [forecastData, setForecastData] = useState({
    projection: [],
    breakEven: 0,
  });
  const [activeTab, setActiveTab] = useState('prediction');
  const [inputMode, setInputMode] = useState('easy');
  const [units, setUnits] = useState(100);
  const [unitPrice, setUnitPrice] = useState(0);
  const [unitCost, setUnitCost] = useState(0);
  const [oneTimeRevenue, setOneTimeRevenue] = useState(0);
  const [oneTimeCost, setOneTimeCost] = useState(0);
  const [timeline, setTimeline] = useState('1y');
  const [showProjectManager, setShowProjectManager] = useState(false);
  const [isCreatingNewProject, setIsCreatingNewProject] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(() => {
    try {
      const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
      return !storedUser;
    } catch {
      return true;
    }
  });
  const [authMode, setAuthMode] = useState('login');
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState(null);
  const [showProfileSettings, setShowProfileSettings] = useState(false);
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('user') || sessionStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [persistenceType, setPersistenceType] = useState(() => {
    return localStorage.getItem('user') ? 'local' : 'session';
  });
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [activeView, setActiveView] = useState('dashboard');
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Projects state: list of all projects
  const [projects, setProjects] = useState([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);

  const [activeProjectId, setActiveProjectId] = useState(null);

  // Load user-specific data when user changes
  useEffect(() => {
    if (user) {
      const activeKey = `activeProjectId_${user.email}`;
      
      setIsLoadingProjects(true);
      api.getProjects(user).then(data => {
        setProjects(data);
        const storedActive = localStorage.getItem(activeKey);
        setActiveProjectId(storedActive || null);
        setIsLoadingProjects(false);
        setIsInitialized(true);
      }).catch(() => {
        setIsLoadingProjects(false);
        setIsInitialized(true);
      });
    } else {
      setProjects([]);
      setActiveProjectId(null);
      setIsInitialized(true);
    }
  }, [user]);

  // Persist projects and active ID
  useEffect(() => {
    if (user) {
      api.saveProjects(user, projects).catch(console.error);
    }
  }, [projects, user]);

  useEffect(() => {
    if (user && isInitialized) {
      if (activeProjectId) {
        localStorage.setItem(`activeProjectId_${user.email}`, activeProjectId);
      } else {
        localStorage.removeItem(`activeProjectId_${user.email}`);
      }
    }
  }, [activeProjectId, user, isInitialized]);

  useEffect(() => { // Persist user based on "Remember Me"
    if (user) {
      const storage = persistenceType === 'local' ? localStorage : sessionStorage;
      storage.setItem('user', JSON.stringify(user));
      const other = persistenceType === 'local' ? sessionStorage : localStorage;
      other.removeItem('user');
    } else {
      localStorage.removeItem('user');
      sessionStorage.removeItem('user');
    }
  }, [user, persistenceType]);

  useEffect(() => { // Persist language
    try { localStorage.setItem('language', language); } catch {}
  }, [language]);
  const activeProject = projects.find(p => p.id === activeProjectId);

  // Load active project data into inputs when switching projects
  useEffect(() => {
    if (activeProject) {
      setCashBalance(activeProject.initialCash || 0);
      setMonthlyRevenue(activeProject.monthlyRevenue || 0);
      setActiveView('dashboard'); // Reset to dashboard view when project changes
      setFixedCosts(activeProject.fixedCosts || 0);
      setVariableCosts(activeProject.variableCosts || 0);
      setRevenueGrowth(activeProject.revenueGrowth || 0);
      setUnits(activeProject.units || 100);
      
      // Load or derive unit price/cost
      const u = activeProject.units || 100;
      let loadedPrice = activeProject.unitPrice;
      if (loadedPrice === undefined) loadedPrice = u > 0 ? (activeProject.monthlyRevenue || 0) / u : 0;
      setUnitPrice(loadedPrice);

      let loadedCost = activeProject.unitCost;
      if (loadedCost === undefined) loadedCost = u > 0 ? (activeProject.variableCosts || 0) / u : 0;
      setUnitCost(loadedCost);

      setOneTimeRevenue(activeProject.oneTimeRevenue || 0);
      setOneTimeCost(activeProject.oneTimeCost || 0);
      setInputMode(activeProject.inputMode || 'easy');
    }
  }, [activeProjectId]); // Only run when switching projects

  // Sync inputs back to active project in the list
  useEffect(() => {
    if (activeProjectId) {
      setProjects(prev => prev.map(p => {
        if (p.id === activeProjectId) {
          return {
            ...p,
            initialCash: cashBalance,
            monthlyRevenue: monthlyRevenue,
            fixedCosts: fixedCosts,
            variableCosts: variableCosts,
            revenueGrowth: revenueGrowth,
            units: units,
            unitPrice: unitPrice,
            unitCost: unitCost,
            oneTimeRevenue: oneTimeRevenue,
            oneTimeCost: oneTimeCost,
            inputMode: inputMode
          };
        }
        return p;
      }));
    }
  }, [cashBalance, monthlyRevenue, fixedCosts, variableCosts, revenueGrowth, units, unitPrice, unitCost, oneTimeRevenue, oneTimeCost, inputMode]);

  const createProject = (proj) => {
    const newId = Date.now().toString();
    const newProject = {
      ...proj,
      id: newId,
      // Ensure defaults are set
      monthlyRevenue: proj.monthlyRevenue || ((proj.profitPerItem || 0) * (proj.unitsPerMonth || 0)) || 0,
      fixedCosts: proj.fixedCosts || proj.monthlyFixedCosts || 0,
      variableCosts: proj.variableCosts || 0,
      revenueGrowth: proj.revenueGrowth || 0,
      units: proj.unitsPerMonth || 100,
      unitPrice: proj.profitPerItem ? (proj.profitPerItem + (proj.variableCosts && proj.unitsPerMonth ? proj.variableCosts/proj.unitsPerMonth : 0)) : 0,
      unitCost: proj.variableCosts && proj.unitsPerMonth ? proj.variableCosts/proj.unitsPerMonth : 0,
      inputMode: 'easy'
    };

    setProjects(prev => [...prev, newProject]);
    setActiveProjectId(newId);
    setShowOverview(true);
    setShowProjectManager(false);
    setIsCreatingNewProject(false); // Project created, reset creation mode
  };

  const handleGoHome = () => {
    setActiveProjectId(null);
    setShowProjectManager(false);
    setShowOverview(false);
    setIsCreatingNewProject(false); // Always show full welcome page when going home
    setActiveView('dashboard');
    setShowProfileSettings(false);
  };

  const confirmDeleteProject = () => {
    if (projectToDelete) {
      const remainingProjects = projects.filter(p => p.id !== projectToDelete);
      setProjects(remainingProjects);

      if (activeProjectId === projectToDelete) {
        if (remainingProjects.length > 0) {
          setActiveProjectId(remainingProjects[0].id);
        } else {
          setActiveProjectId(null);
        }
      }
      setProjectToDelete(null);
    }
  };

  const handleNewProject = () => {
    setActiveProjectId(null);
    setIsCreatingNewProject(true); // Indicate that we are starting a new project flow
    setActiveView('dashboard');
    setShowOverview(false);
    setShowProjectManager(false);
  };

  const handleAuth = async () => {
    setLoginError('');
    if (!emailInput || !passwordInput) {
      setLoginError(t.fillAllFields);
      return;
    }

    if (authMode === 'signup') {
      if (passwordInput.length < 8) {
        setLoginError(translations[language].passwordTooShort);
        return;
      }
      if (passwordInput !== confirmPasswordInput) {
        setLoginError(translations[language].passwordsDoNotMatch);
        return;
      }
    }

    setIsAuthenticating(true);
    try {
      let data;
      if (authMode === 'signup') {
        data = await api.signup(emailInput, passwordInput);
      } else {
        data = await api.login(emailInput, passwordInput);
      }
      
      const type = rememberMe ? 'local' : 'session';
      setPersistenceType(type);
      setUser(data.user);
      if (data.token) {
        (type === 'local' ? localStorage : sessionStorage).setItem('authToken', data.token);
      }
      setShowLoginModal(false);
    } catch (err) {
      setLoginError(err.message || 'Authentication failed');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleForgotPassword = () => {
    setLoginError('');
    if (!emailInput) {
      setLoginError(translations[language].enterEmail);
      return;
    }
    // Simulate sending email
    alert(translations[language].resetLinkSent(emailInput));
    setAuthMode('login');
  };

  const handleAdvancedTabClick = () => {
    if (!user?.isPremium) {
        alert(t.upgradeForAdvanced);
    } else {
        setInputMode('advanced');
    }
  };

  const handleExport = () => {
    if (!user?.isPremium) {
        alert(t.upgradeToExport);
        return;
    }
    const rows = [
        ['Month', t.cashBalanceLabel],
        ...chartLabels.map((label, index) => [label, forecastData.projection[index]])
    ];
    const csvContent = "data:text/csv;charset=utf-8," 
        + rows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${activeProject.name}_forecast.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const premiumFeaturesList = [
      { key: 'invoices', label: t.welcome.premiumFeature7 },
      { key: 'customers', label: t.welcome.premiumFeature8 },
      { key: 'banking', label: t.welcome.premiumFeature9 },
      { key: 'tax', label: t.welcome.premiumFeature10 },
      { key: 'payroll', label: t.welcome.premiumFeature11 },
      { key: 'inventory', label: t.welcome.premiumFeature12 },
      { key: 'suppliers', label: t.welcome.premiumFeature13 },
      { key: 'assets', label: t.welcome.premiumFeature14 },
  ];

  const handleFeatureClick = (key) => {
      if (!user?.isPremium) {
          alert(t.upgradeForFeature);
          return;
      }
      setActiveView(key);
  };

  const handleUpgradeToPremium = async () => {
    if (!user) return;
    try {
      const updatedUser = await api.upgradeToPremium(user.email);
      setUser(updatedUser);
    } catch (error) {
      console.error("Upgrade failed:", error);
    }
  };

  const handleUpdateUser = (updatedUser) => {
    const oldEmail = user.email;
    const newEmail = updatedUser.email;

    // If email changed, migrate data
    if (oldEmail !== newEmail) {
      const userProjects = localStorage.getItem(`projects_${oldEmail}`);
      const userActiveId = localStorage.getItem(`activeProjectId_${oldEmail}`);
      
      if (userProjects) {
        localStorage.setItem(`projects_${newEmail}`, userProjects);
        localStorage.removeItem(`projects_${oldEmail}`);
      }
      if (userActiveId) {
        localStorage.setItem(`activeProjectId_${newEmail}`, userActiveId);
        localStorage.removeItem(`activeProjectId_${oldEmail}`);
      }
    }

    setUser(updatedUser);
    setShowProfileSettings(false);
  };

  const handleDeleteAccount = async () => {
    if (accountToDelete) {
      // Log out the user if they deleted their own account
      if (user && user.email === accountToDelete) {
        handleLogout();
        await api.deleteAccount(accountToDelete);
      }
      
      setAccountToDelete(null);
      setShowProfileSettings(false); // Close profile settings after deletion
      setShowProjectManager(false); // Go back to welcome page
      setShowLoginModal(true); // Show login modal again
      setAuthMode('signup'); // Default to signup after account deletion
    }
  };

  const handleLogout = () => {
    setUser(null);
    setActiveProjectId(null);
    setShowProjectManager(false);
    setShowOverview(false);
    setShowProfileDropdown(false);
    setShowProfileSettings(false);
    setActiveView('dashboard');
    localStorage.removeItem('authToken');
    sessionStorage.removeItem('authToken');
  };

  const [showOverview, setShowOverview] = useState(false);

  const updateProject = (updated) => {
    setProjects(prev => prev.map(p => p.id === updated.id ? updated : p));
    // Also update local state immediately
    setCashBalance(updated.initialCash || 0);
    setMonthlyRevenue(updated.monthlyRevenue || 0);
    setFixedCosts(updated.fixedCosts || 0);
    setVariableCosts(updated.variableCosts || 0);
    setRevenueGrowth(updated.revenueGrowth || 0);
    setUnits(updated.units || 100);
    setUnitPrice(updated.unitPrice || 0);
    setUnitCost(updated.unitCost || 0);
  };

  useEffect(() => {
    const variableCostsPercentage = monthlyRevenue > 0 ? variableCosts / monthlyRevenue : 0;
    const breakEven = fixedCosts / (1 - variableCostsPercentage);

    let currentCash = cashBalance;
    const projection = [];

    let iterations = 12;
    let revenueFactor = 1; // 1 = monthly, 1/30 = daily, 1/4.33 = weekly
    let growthDivisor = 1; // 1 = monthly growth

    switch (timeline) {
      case '7d':
        iterations = 7;
        revenueFactor = 1 / 30;
        growthDivisor = 30;
        break;
      case '1m':
        iterations = 30;
        revenueFactor = 1 / 30;
        growthDivisor = 30;
        break;
      case '3m':
        iterations = 12; // 12 weeks
        revenueFactor = 1 / 4.33;
        growthDivisor = 4.33;
        break;
      case '6m':
        iterations = 6;
        break;
      case '1y':
      default:
        iterations = 12;
        break;
    }

    for (let i = 0; i < iterations; i++) {
      const revenueThisStep = monthlyRevenue * revenueFactor * Math.pow((1 + revenueGrowth / 100), i / growthDivisor);
      let profitThisStep = revenueThisStep - (fixedCosts * revenueFactor) - (revenueThisStep * variableCostsPercentage);

      // Add one-time events only in the first month of projection
      if (i === 0) {
        profitThisStep += (oneTimeRevenue || 0);
        profitThisStep -= (oneTimeCost || 0);
      }

      currentCash += profitThisStep; // Add this month's profit to cash
      projection.push(currentCash);
    }

  // It's OK to update derived forecast state here after computing projection
  // eslint-disable-next-line react-hooks/set-state-in-effect
  setForecastData({ projection, breakEven });
  }, [cashBalance, monthlyRevenue, fixedCosts, variableCosts, revenueGrowth, oneTimeRevenue, oneTimeCost, timeline]);

  const getChartLabels = () => {
    const labels = [];
    const now = new Date();
    
    if (timeline === '7d' || timeline === '1m') {
      const days = timeline === '7d' ? 7 : 30;
      for (let i = 1; i <= days; i++) {
        const d = new Date(now);
        d.setDate(d.getDate() + i);
        labels.push(d.getDate() + '.' + (d.getMonth() + 1) + '.');
      }
    } else if (timeline === '3m') {
      for (let i = 1; i <= 12; i++) {
        labels.push('W' + i);
      }
    } else {
      const months = timeline === '6m' ? 6 : 12;
      for (let i = 1; i <= months; i++) {
        const d = new Date(now);
        d.setMonth(d.getMonth() + i);
        labels.push(d.toLocaleString(language === 'fi' ? 'fi-FI' : 'en-US', { month: 'short' }));
      }
    }
    return labels;
  };

  const chartLabels = getChartLabels();

  const chartData = {
    labels: chartLabels,
    datasets: [
      {
        label: t.cashBalanceLabel,
        data: forecastData.projection,
        borderColor: '#2f9e44',
        backgroundColor: 'rgba(47, 158, 68, 0.15)',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false, // Cleaner look
      },
      title: {
        display: false, // We have a card title already
      },
      tooltip: {
        backgroundColor: '#fff',
        titleColor: '#202223',
        bodyColor: '#6d7175',
        borderColor: '#e1e3e5',
        borderWidth: 1,
        padding: 10,
        displayColors: false,
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat(language === 'fi' ? 'fi-FI' : 'en-US', { style: 'currency', currency: 'EUR' }).format(context.parsed.y);
            }
            return label;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: '#f1f3f5', // Very subtle grid
          drawBorder: false,
        },
        border: { display: false },
        ticks: {
          font: { family: "'Inter', sans-serif", size: 11 },
          color: '#6d7175',
          callback: function(value) {
            return new Intl.NumberFormat(language === 'fi' ? 'fi-FI' : 'en-US', { notation: "compact", compactDisplay: "short" }).format(value) + ' €';
          }
        }
      },
      x: {
        grid: {
          display: false,
          drawBorder: false,
        },
        border: { display: false },
        ticks: {
          font: { family: "'Inter', sans-serif", size: 11 },
          color: '#6d7175'
        },
      }
    },
    interaction: {
      mode: 'index',
      intersect: false,
    },
  };

  const loginModal = showLoginModal && (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      zIndex: 2000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backdropFilter: 'blur(5px)'
    }}>
      <div className="card border-0 shadow-lg fade-scale" style={{
        width: '100%',
        maxWidth: '400px',
        borderRadius: '24px',
        backgroundColor: '#ffffff'
      }}>
        <div className="card-body p-5">
          <div className="text-center mb-4">
            <h3 className="fw-bold mb-1">{authMode === 'login' ? 'Log In' : (authMode === 'signup' ? 'Sign Up' : t.resetPassword)}</h3>
            <p className="text-muted small">{authMode === 'login' ? 'Welcome back to Revion' : (authMode === 'signup' ? 'Create your Revion account' : t.enterEmailReset)}</p>
          </div>
          <div className="d-flex flex-column gap-3">
            {loginError && <div className="alert alert-danger py-2 small mb-0">{loginError}</div>}
            <div>
              <label className="form-label small fw-bold text-secondary">Email</label>
              <input type="email" className="form-control" placeholder="name@example.com" value={emailInput} onChange={(e) => setEmailInput(e.target.value)} />
            </div>
            {authMode !== 'forgot-password' && (
              <div>
                <div className="d-flex justify-content-between align-items-center">
                  <label className="form-label small fw-bold text-secondary">Password</label>
                  {authMode === 'login' && <button className="btn btn-link p-0 small text-decoration-none" style={{fontSize: '0.75rem'}} onClick={() => { setAuthMode('forgot-password'); setLoginError(''); }}>{t.forgotPassword}</button>}
                </div>
                <div className="input-group">
                  <input type={showPassword ? "text" : "password"} className="form-control" placeholder="••••••••" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} />
                  <button className="btn btn-outline-secondary" type="button" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M13.359 11.238C15.06 9.72 16 8 16 8s-3-5.5-8-5.5a7.028 7.028 0 0 0-2.79.588l.77.771A5.944 5.944 0 0 1 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.134 13.134 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755-.165.165-.337.328-.517.486l.708.709z"/><path d="M11.297 9.377L9.499 7.58A1.12 1.12 0 0 0 8 7.125l-1.279 1.278a1.12 1.12 0 0 0 .329 1.748l1.748.329a1.12 1.12 0 0 0 1.5-.503zM3.694 2.96l1.302 1.299a4.296 4.296 0 0 0-.496.768C3.23 6.38 2 8 2 8s3 5.5 8 5.5c.747 0 1.487-.155 2.197-.436l1.297 1.296a1.5 1.5 0 1 0 2.121-2.12l-12.93-12.93a1.5 1.5 0 0 0-2.121 2.12zm4.915 4.916l1.935 1.935a2.498 2.498 0 0 1-2.544-2.544z"/>
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z"/><path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z"/>
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            )}
            {authMode === 'login' && (
              <div className="form-check mb-3">
                <input className="form-check-input" type="checkbox" id="rememberMe" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
                <label className="form-check-label small text-secondary" htmlFor="rememberMe">Remember me</label>
              </div>
            )}
            {authMode === 'signup' && (
              <div>
                <label className="form-label small fw-bold text-secondary">Confirm Password</label>
                <input type="password" className="form-control" placeholder="••••••••" value={confirmPasswordInput} onChange={(e) => setConfirmPasswordInput(e.target.value)} />
              </div>
            )}
            
            {authMode === 'forgot-password' ? (
              <button className="btn btn-primary w-100 fw-bold py-2 mt-2" onClick={handleForgotPassword}>{t.sendResetLink}</button>
            ) : (
              <button className="btn btn-primary w-100 fw-bold py-2 mt-2" onClick={handleAuth} disabled={isAuthenticating}>
                {isAuthenticating ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    {authMode === 'login' ? 'Logging In...' : 'Signing Up...'}
                  </>
                ) : (authMode === 'login' ? 'Log In' : 'Sign Up')}
              </button>
            )}
            
            <div className="d-flex align-items-center my-2">
              <hr className="flex-grow-1 m-0 text-muted" style={{opacity: 0.25}} />
              <span className="px-3 text-muted small fw-bold" style={{fontSize: '0.7rem'}}>OR</span>
              <hr className="flex-grow-1 m-0 text-muted" style={{opacity: 0.25}} />
            </div>

            {authMode !== 'forgot-password' && (
              <button className="btn btn-outline-secondary w-100 fw-bold py-2 d-flex align-items-center justify-content-center gap-2" style={{backgroundColor: '#fff', color: '#202223', borderColor: '#e1e3e5'}}>
                <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                {authMode === 'login' ? 'Log in with Gmail' : 'Sign up with Gmail'}
              </button>
            )}
            
            <div className="text-center mt-2">
              {authMode === 'forgot-password' ? (
                <p className="small text-muted mb-0"><button className="btn btn-link p-0 small fw-bold text-decoration-none" onClick={() => { setAuthMode('login'); setLoginError(''); }}>{t.backToLogin}</button></p>
              ) : authMode === 'login' ? (
                <p className="small text-muted mb-0">Don't have an account? <button className="btn btn-link p-0 small fw-bold text-decoration-none" onClick={() => { setAuthMode('signup'); setLoginError(''); }}>Sign Up</button></p>
              ) : (
                <p className="small text-muted mb-0">Already have an account? <button className="btn btn-link p-0 small fw-bold text-decoration-none" onClick={() => { setAuthMode('login'); setLoginError(''); }}>Log In</button></p>
              )}
            </div>

            <div className="text-center mt-2">
              <button className="btn btn-link text-secondary text-decoration-none small" onClick={() => setShowLoginModal(false)}>{t.later}</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (showProfileSettings && user) {
    return (
      <ProfileSettings 
        user={user} 
        onUpdateUser={handleUpdateUser} 
        onClose={() => setShowProfileSettings(false)} 
        onDeleteAccount={setAccountToDelete}
        t={t} 
      />
    );
  }

  // Account deletion confirmation modal
  if (accountToDelete) {
    return (
      <>
        <div className="modal-backdrop fade show"></div>
        <div className="modal fade show d-block" tabIndex="-1" role="dialog">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{t.deleteAccount}</h5>
                <button type="button" className="btn-close" onClick={() => setAccountToDelete(null)}></button>
              </div>
              <div className="modal-body">
                <p dangerouslySetInnerHTML={{ __html: t.confirmAccountDelete(accountToDelete) }} />
                <p className="small text-muted mb-0">{t.deleteAccountWarning}</p>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setAccountToDelete(null)}>{t.cancel}</button>
                <button type="button" className="btn btn-danger" onClick={handleDeleteAccount}>{t.deleteAccount}</button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (showProjectManager) {
    return (
      <div className="app-container">
        {loginModal}
        <nav className="top-nav">
          <div className="d-flex align-items-center gap-3">
            <a href="#" className="nav-logo" onClick={(e) => { e.preventDefault(); handleGoHome(); }} title="Go to Front Page">Revion</a>
          </div>
          <div className="nav-actions">
            {user ? (
              <div className="profile-dropdown-container">
                <button className="btn btn-sm btn-light border rounded-pill d-flex align-items-center gap-2" onClick={() => setShowProfileDropdown(prev => !prev)}>
                  <span className="fw-bold">{user.name}</span>
                  {user.isPremium && <span className="badge bg-warning text-dark">Premium</span>}
                </button>
                {showProfileDropdown && (
                  <div className="profile-dropdown card border-0 shadow-lg fade-scale">
                    <div className="p-3 border-bottom">
                      <p className="small text-muted mb-0">Signed in as</p>
                      <p className="fw-bold mb-0">{user.email}</p>
                    </div>
                    <button className="dropdown-item" onClick={() => { setShowProfileSettings(true); setShowProfileDropdown(false); }}>{t.profileSettings}</button>
                    {user.isPremium && <a href="mailto:support@revion.app?subject=Premium Support Request" className="dropdown-item">{t.welcome.premiumFeature5}</a>}
                    <div className="dropdown-divider"></div>
                    <div className="px-3 pt-2 pb-1">
                        <small className="text-muted fw-bold">{t.language}</small>
                    </div>
                    <button className={`dropdown-item ${language === 'en' ? 'active' : ''}`} onClick={() => setLanguage('en')}>{t.english || 'English'}</button>
                    <button className={`dropdown-item ${language === 'fi' ? 'active' : ''}`} onClick={() => setLanguage('fi')}>{t.finnish || 'Suomi'}</button>
                    <div className="dropdown-divider"></div>
                    <button className="dropdown-item text-danger" onClick={handleLogout}>Log Out</button>
                  </div>
                )}
              </div>
            ) : <button className="btn btn-sm btn-primary" onClick={() => setShowLoginModal(true)}>Log In</button>}
          </div>
        </nav>
        <main className="p-4 mx-auto" style={{maxWidth: '1200px'}}>
          <h2 className="mb-4 text-center">{t.yourProjects}</h2>
          {isLoadingProjects && <div className="text-center text-muted">Loading...</div>}
          <div className="project-grid">
            {projects.map(p => (
              <div key={p.id} className={`project-card ${activeProjectId === p.id ? 'active' : ''}`} onClick={() => {
                setActiveProjectId(p.id);
                setActiveView('dashboard');
                setShowProjectManager(false);
              }}>
                <button className="btn-delete-project" title={`${t.deleteProject} ${p.name}`} onClick={(e) => {
                  e.stopPropagation(); // Prevent card click
                  setProjectToDelete(p.id);
                }}>
                  &times;
                </button>
                <h3 className="h5 mb-2">{p.name}</h3>
                <p className="text-secondary small mb-0">{t.lastUpdated}: {new Date(parseInt(p.id)).toLocaleDateString()}</p>
              </div>
            ))}
            {(!user?.isPremium && projects.length >= 1) ? (
              <div className="project-card new-project" style={{cursor: 'not-allowed', opacity: 0.7}} title={t.upgradeToCreateMore}>
                <div className="text-center">
                  <span className="d-block h3 mb-2">🔒</span>
                  <span className="fw-bold">{t.welcome.premiumFeature2}</span>
                </div>
              </div>
            ) : (
              <div className="project-card new-project" onClick={handleNewProject}>
                <div className="text-center">
                  <span className="d-block h3 mb-2">+</span>
                  <span className="fw-bold">{t.newProject}</span>
                </div>
              </div>
            )}
          </div>

          {projectToDelete && (
            <>
              <div className="modal-backdrop fade show"></div>
              <div className="modal fade show d-block" tabIndex="-1" role="dialog">
                <div className="modal-dialog modal-dialog-centered">
                  <div className="modal-content">
                    <div className="modal-header">
                      <h5 className="modal-title">{t.deleteProject}</h5>
                      <button type="button" className="btn-close" onClick={() => setProjectToDelete(null)}></button>
                    </div>
                    <div className="modal-body">
                      <p dangerouslySetInnerHTML={{ __html: t.confirmDelete(projects.find(p => p.id === projectToDelete)?.name) }} />
                      <p className="small text-muted mb-0">{t.actionCannotBeUndone}</p>
                    </div>
                    <div className="modal-footer">
                      <button type="button" className="btn btn-secondary" onClick={() => setProjectToDelete(null)}>{t.cancel}</button>
                      <button type="button" className="btn btn-danger" onClick={confirmDeleteProject}>{t.deleteProject}</button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    );
  }

  if (!activeProject) {
    // Show Welcome front page first; Welcome will call back into createProject when finished
    return (
      <>
        {loginModal}
        <Welcome
          onStartExisting={createProject}
          onStartNew={createProject}
          onShowManager={() => setShowProjectManager(true)}
          t={t}
          language={language}
          existingProjects={projects}
          user={user}
          onOpenLogin={() => setShowLoginModal(true)}
          onOpenProfile={() => setShowProfileSettings(true)}
          onUpgradeToPremium={handleUpgradeToPremium}
          onLogout={handleLogout}
          isCreatingNewProject={isCreatingNewProject}
          onChangeLanguage={(lang) => {
            try { localStorage.setItem('language', lang); } catch { void 0; }
            setLanguage(lang);
          }}
        />
      </>
    );
  }

  if (showOverview) {
    return (
      <>
        {loginModal}
        <Overview project={activeProject} onUpdateProject={updateProject} onContinue={() => setShowOverview(false)} onHome={handleGoHome} t={t} />
      </>
    );
  }

  const dashboardStyles = `
    .app-wrapper { display: grid; grid-template-columns: 240px 1fr; gap: 1.5rem; align-items: start; }
    .sidebar { background: #fff; border-radius: 0.75rem; padding: 1rem; box-shadow: 0 1px 3px rgba(0,0,0,0.05); position: sticky; top: 1rem; }
    .dashboard-grid { display: grid; grid-template-columns: 350px 1fr; gap: 1rem; }
    .nav-item-custom { display: block; padding: 0.6rem 1rem; color: #495057; text-decoration: none; border-radius: 0.5rem; margin-bottom: 0.25rem; transition: all 0.2s; font-weight: 500; }
    .nav-item-custom:hover { background-color: #f8f9fa; color: #212529; }
    .nav-item-custom.active { background-color: #e7f5ff; color: #1971c2; }
    @media (max-width: 1200px) { .dashboard-grid { grid-template-columns: 1fr; } }
    @media (max-width: 992px) { .app-wrapper { grid-template-columns: 1fr; } .sidebar { position: static; margin-bottom: 1rem; } }
  `;

  return (
    <div className="app-container">
      <style>{dashboardStyles}</style>
      {loginModal}
      {/* Navigation */}
      <nav className="top-nav">
        <div className="d-flex align-items-center gap-3">
          <a href="#" className="nav-logo" onClick={(e) => { e.preventDefault(); handleGoHome(); }} title="Go to Front Page">Revion</a>
          
          <div className="d-flex align-items-center gap-2">
            <span className="fw-bold text-dark">{activeProject.name}</span>
            <button className="btn btn-sm btn-light border text-secondary" onClick={() => setShowProjectManager(true)}>{t.changeProject}</button>
          </div>
        </div>
        <div className="nav-actions">
          <button className="btn btn-sm btn-outline-secondary me-2" onClick={handleExport}>
            {t.export}
            {!user?.isPremium && <span className="ms-1 opacity-50">🔒</span>}
          </button>
          <div className="position-relative d-inline-block me-2">
            <button 
              className="btn btn-sm btn-white border shadow-sm fw-medium d-flex align-items-center gap-2"
              onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
            >
              <span>{language.toUpperCase()}</span>
              <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg" style={{transform: showLanguageDropdown ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s'}}>
                <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            {showLanguageDropdown && (
              <div className="dropdown-menu show position-absolute end-0 mt-2 shadow-lg border-0 fade-scale" style={{minWidth: '150px', zIndex: 1000}}>
                <button className={`dropdown-item d-flex align-items-center justify-content-between ${language === 'en' ? 'active' : ''}`} onClick={() => { setLanguage('en'); setShowLanguageDropdown(false); }}>
                  <span>English</span>
                  {language === 'en' && <span>✓</span>}
                </button>
                <button className={`dropdown-item d-flex align-items-center justify-content-between ${language === 'fi' ? 'active' : ''}`} onClick={() => { setLanguage('fi'); setShowLanguageDropdown(false); }}>
                  <span>Suomi</span>
                  {language === 'fi' && <span>✓</span>}
                </button>
              </div>
            )}
          </div>
          {user ? (
              <div className="profile-dropdown-container">
                <button className="btn btn-sm btn-light border rounded-pill px-3 d-flex align-items-center gap-2" onClick={() => setShowProfileDropdown(prev => !prev)}>
                  <span className="fw-bold">{user.name}</span>
                  {user.isPremium && <span className="badge bg-warning text-dark">Premium</span>}
                </button>
                {showProfileDropdown && (
                  <div className="profile-dropdown card border-0 shadow-lg fade-scale">
                    <div className="p-3 border-bottom">
                      <p className="small text-muted mb-0">Signed in as</p>
                      <p className="fw-bold mb-0">{user.email}</p>
                    </div>
                    <button className="dropdown-item" onClick={() => { setShowProfileSettings(true); setShowProfileDropdown(false); }}>{t.profileSettings}</button>
                    {user.isPremium && <a href="mailto:support@revion.app?subject=Premium Support Request" className="dropdown-item">{t.welcome.premiumFeature5}</a>}
                    <div className="dropdown-divider"></div>
                    <button className="dropdown-item text-danger" onClick={handleLogout}>Log Out</button>
                  </div>
                )}
              </div>
            ) : <button className="btn btn-sm btn-primary" onClick={() => setShowLoginModal(true)}>Log In</button>}
        </div>
      </nav>

      {/* Main Layout */}
      <main className="p-4 mx-auto" style={{maxWidth: '1600px'}}>
        <div className="app-wrapper">
          <aside className="sidebar">
            <a href="#" className={`nav-item-custom ${activeView === 'dashboard' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveView('dashboard'); }}>
              {t.predictionTab}
            </a>
            <hr className="my-2 text-muted opacity-25" />
            {premiumFeaturesList.map(feature => (
              <a key={feature.key} href="#" className={`nav-item-custom d-flex justify-content-between align-items-center ${activeView === feature.key ? 'active' : ''}`} onClick={(e) => {
                  e.preventDefault();
                  handleFeatureClick(feature.key);
              }}>
                  <span>{feature.label}</span>
                  {!user?.isPremium && <span className="opacity-50 small">🔒</span>}
              </a>
            ))}
          </aside>
          <div className="main-content">
            {activeView === 'dashboard' ? (
          <div className="dashboard-grid">
            {/* Left Column: Inputs */}
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body p-3">
                <div className="bg-light p-1 rounded-pill d-inline-flex mb-4">
                  <button 
                    className={`btn btn-sm rounded-pill px-3 ${inputMode === 'easy' ? 'btn-white shadow-sm fw-bold' : 'text-muted'}`} 
                    onClick={() => setInputMode('easy')}
                    style={inputMode === 'easy' ? {backgroundColor: '#fff'} : {border: 'none'}}
                  >
                    {t.easyTab}
                  </button>
                  <button 
                    className={`btn btn-sm rounded-pill px-3 ${inputMode === 'advanced' ? 'btn-white shadow-sm fw-bold' : 'text-muted'}`} 
                    onClick={handleAdvancedTabClick}
                    style={inputMode === 'advanced' ? {backgroundColor: '#fff'} : {border: 'none'}}
                  >
                    {t.advancedTab} {!user?.isPremium && <span className="ms-2 opacity-50">🔒</span>}
                  </button>
                </div>

                {inputMode === 'easy' && (
                  <div className="p-1 fade-scale">
                    <div className="d-flex flex-column gap-3">
                      <div>
                        <label htmlFor="easy-units" className="form-label small text-muted fw-bold">{t.unitsSold}</label>
                        <input type="number" className="form-control" id="easy-units" placeholder="0" value={units === 0 ? '' : units} onChange={(e) => {
                          const newUnits = parseFloat(e.target.value) || 0;
                          setUnits(newUnits);
                          // Update totals based on stored unit prices
                          setMonthlyRevenue(unitPrice * newUnits);
                          setVariableCosts(unitCost * newUnits);
                        }} />
                      </div>
                      <div>
                        <label htmlFor="easy-price" className="form-label small text-muted fw-bold">{t.pricePerUnit}</label>
                        <div className="input-group">
                          <span className="input-group-text bg-white border-end-0 text-muted">€</span>
                          <input type="number" className="form-control border-start-0 ps-1" id="easy-price" placeholder="0" value={unitPrice === 0 ? '' : unitPrice} onChange={(e) => {
                            const newPrice = parseFloat(e.target.value) || 0;
                            setUnitPrice(newPrice);
                            setMonthlyRevenue(newPrice * units);
                          }} />
                        </div>
                      </div>
                      <div>
                        <label htmlFor="easy-cost" className="form-label small text-muted fw-bold">{t.costPerUnit}</label>
                        <div className="input-group">
                          <span className="input-group-text bg-white border-end-0 text-muted">€</span>
                          <input type="number" className="form-control border-start-0 ps-1" id="easy-cost" placeholder="0" value={unitCost === 0 ? '' : unitCost} onChange={(e) => {
                            const newCost = parseFloat(e.target.value) || 0;
                            setUnitCost(newCost);
                            setVariableCosts(newCost * units);
                          }} />
                        </div>
                      </div>
                      <hr />
                      <div>
                        <label htmlFor="easy-fixed" className="form-label small text-muted fw-bold">{t.fixedCosts}</label>
                        <div className="input-group">
                          <span className="input-group-text bg-white border-end-0 text-muted">€</span>
                          <input type="number" className="form-control border-start-0 ps-1" id="easy-fixed" placeholder="0" value={fixedCosts === 0 ? '' : fixedCosts} onChange={(e) => setFixedCosts(parseFloat(e.target.value) || 0)} />
                        </div>
                      </div>
                      <div>
                        <label htmlFor="easy-cash" className="form-label small text-muted fw-bold">{t.cashBalance}</label>
                        <div className="input-group">
                          <span className="input-group-text bg-white border-end-0 text-muted">€</span>
                          <input type="number" className="form-control border-start-0 ps-1" id="easy-cash" placeholder="0" value={cashBalance === 0 ? '' : cashBalance} onChange={(e) => setCashBalance(parseFloat(e.target.value) || 0)} />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {inputMode === 'advanced' && (
                  <div className="p-1 fade-scale">
                    <div className="d-flex flex-column gap-4">
                      {/* Core */}
                      <div>
                        <label htmlFor="cashBalance" className="form-label small text-muted fw-bold">{t.cashBalance}</label>
                        <div className="input-group">
                          <span className="input-group-text bg-white border-end-0 text-muted">€</span>
                          <input type="number" className="form-control border-start-0 ps-1" id="cashBalance" placeholder="0" value={cashBalance === 0 ? '' : cashBalance} onChange={(e) => setCashBalance(parseFloat(e.target.value) || 0)} />
                        </div>
                      </div>
                      {/* Income */}
                      <div>
                        <h6 className="text-uppercase text-secondary fw-bold" style={{fontSize: '0.75rem', letterSpacing: '1px'}}>{t.income}</h6>
                        <div className="p-3 rounded" style={{backgroundColor: 'var(--page-bg)'}}>
                          <label htmlFor="monthlyRevenue" className="form-label small text-muted fw-bold">{t.monthlyRevenue}</label>
                          <div className="input-group">
                            <span className="input-group-text bg-white border-end-0 text-muted">€</span>
                            <input type="number" className="form-control border-start-0 ps-1" id="monthlyRevenue" placeholder="0" value={monthlyRevenue === 0 ? '' : monthlyRevenue} onChange={(e) => {
                              const val = parseFloat(e.target.value) || 0;
                              setMonthlyRevenue(val);
                              if (units > 0) setUnitPrice(val / units);
                            }} />
                          </div>
                        </div>
                      </div>
                      {/* Costs */}
                      <div>
                        <h6 className="text-uppercase text-secondary fw-bold" style={{fontSize: '0.75rem', letterSpacing: '1px'}}>{t.recurringCosts}</h6>
                        <div className="p-3 rounded d-flex flex-column gap-3" style={{backgroundColor: 'var(--page-bg)'}}>
                          <div>
                            <label htmlFor="fixedCosts" className="form-label small text-muted fw-bold">{t.fixedCosts}</label>
                            <div className="input-group"><span className="input-group-text bg-white border-end-0 text-muted">€</span><input type="number" className="form-control border-start-0 ps-1" id="fixedCosts" placeholder="0" value={fixedCosts === 0 ? '' : fixedCosts} onChange={(e) => setFixedCosts(parseFloat(e.target.value) || 0)} /></div>
                          </div>
                          <div>
                            <label htmlFor="variableCosts" className="form-label small text-muted fw-bold">{t.variableCosts}</label>
                            <div className="input-group"><span className="input-group-text bg-white border-end-0 text-muted">€</span><input type="number" className="form-control border-start-0 ps-1" id="variableCosts" placeholder="0" value={variableCosts === 0 ? '' : variableCosts} onChange={(e) => {
                              const val = parseFloat(e.target.value) || 0;
                              setVariableCosts(val);
                              if (units > 0) setUnitCost(val / units);
                            }} /></div>
                          </div>
                        </div>
                      </div>
                      {/* One-Time Events */}
                      <div>
                        <h6 className="text-uppercase text-secondary fw-bold" style={{fontSize: '0.75rem', letterSpacing: '1px'}}>{t.oneTimeEvents}</h6>
                        <div className="p-3 rounded d-flex flex-column gap-3" style={{backgroundColor: 'var(--page-bg)'}}>
                          <div><label htmlFor="oneTimeRevenue" className="form-label small text-muted fw-bold">{t.oneTimeRevenue}</label><div className="input-group"><span className="input-group-text bg-white border-end-0 text-muted">€</span><input type="number" className="form-control border-start-0 ps-1" id="oneTimeRevenue" placeholder="0" value={oneTimeRevenue === 0 ? '' : oneTimeRevenue} onChange={(e) => setOneTimeRevenue(parseFloat(e.target.value) || 0)} /></div></div>
                          <div><label htmlFor="oneTimeCost" className="form-label small text-muted fw-bold">{t.oneTimeCost}</label><div className="input-group"><span className="input-group-text bg-white border-end-0 text-muted">€</span><input type="number" className="form-control border-start-0 ps-1" id="oneTimeCost" placeholder="0" value={oneTimeCost === 0 ? '' : oneTimeCost} onChange={(e) => setOneTimeCost(parseFloat(e.target.value) || 0)} /></div></div>
                        </div>
                      </div>
                      {/* Assumptions */}
                      <div>
                        <h6 className="text-uppercase text-secondary fw-bold" style={{fontSize: '0.75rem', letterSpacing: '1px'}}>{t.assumptions}</h6>
                        <div className="p-3 rounded" style={{backgroundColor: 'var(--page-bg)'}}>
                          <label htmlFor="revenueGrowth" className="form-label small text-muted fw-bold">{t.revenueGrowth}</label>
                          <div className="input-group"><input type="number" className="form-control border-end-0" id="revenueGrowth" placeholder="0" value={revenueGrowth === 0 ? '' : revenueGrowth} onChange={(e) => setRevenueGrowth(parseFloat(e.target.value) || 0)} /><span className="input-group-text bg-white border-start-0 text-muted">%</span></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Results */}
            <div className="d-flex flex-column gap-4">
              <div className="card border-0 shadow-sm">
                <div className="card-body p-4">
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h5 className="mb-0 fw-bold">{activeTab === 'prediction' ? t.cashFlowForecast : t.breakEvenTab}</h5>
                    <div className="bg-light p-1 rounded-pill d-inline-flex">
                      <button 
                        className={`btn btn-sm rounded-pill px-3 ${activeTab === 'prediction' ? 'btn-white shadow-sm fw-bold' : 'text-muted'}`} 
                        onClick={() => setActiveTab('prediction')}
                        style={activeTab === 'prediction' ? {backgroundColor: '#fff'} : {border: 'none'}}
                      >
                        {t.predictionTab}
                      </button>
                      <button 
                        className={`btn btn-sm rounded-pill px-3 ${activeTab === 'break-even' ? 'btn-white shadow-sm fw-bold' : 'text-muted'}`} 
                        onClick={() => setActiveTab('break-even')}
                        style={activeTab === 'break-even' ? {backgroundColor: '#fff'} : {border: 'none'}}
                      >
                        {t.breakEvenTab}
                      </button>
                    </div>
                  </div>

                  {activeTab === 'prediction' && (
                    <>
                      <div style={{ height: '350px' }}>
                        <Line options={chartOptions} data={chartData} />
                      </div>
                      <div className="mt-4">
                        <StatusMessage projection={forecastData.projection} cashBalance={cashBalance} language={language} />
                      </div>
                    </>
                  )}

                  {activeTab === 'prediction' && (
                    <div className="d-flex justify-content-center gap-2 mt-3">
                      {['7d', '1m', '3m', '6m', '1y'].map(opt => (
                        <button key={opt} className={`btn btn-sm ${timeline === opt ? 'btn-secondary' : 'btn-outline-light text-dark border'}`} onClick={() => setTimeline(opt)}>
                          {opt}
                        </button>
                      ))}
                    </div>
                  )}

                  {activeTab === 'break-even' && (
                    <div className="fade-scale">
                      <div className="p-4 rounded mb-3" style={{backgroundColor: 'var(--page-bg)'}}>
                        <p className="text-secondary mb-1 fw-bold small text-uppercase">{t.breakEvenRevenue}</p>
                        <p className="display-4 fw-bold mb-0">€{!isFinite(forecastData.breakEven) ? '...' : `${new Intl.NumberFormat('fi-FI').format(forecastData.breakEven)}`}</p>
                      </div>
                      
                      <div className="row g-3 mb-3">
                          <div className="col-12 col-md-6">
                           <div className="p-3 border rounded h-100 bg-white">
                              <p className="text-secondary mb-1 small fw-bold text-uppercase">{t.currentRevenue}</p>
                              <p className="h3 mb-0">€{new Intl.NumberFormat('fi-FI').format(monthlyRevenue)}</p>
                           </div>
                        </div>
                        <div className="col-12 col-md-6">
                           <div className={`p-3 border rounded h-100 ${monthlyRevenue >= forecastData.breakEven ? 'bg-success-subtle border-success-subtle' : 'bg-warning-subtle border-warning-subtle'}`}>
                              <p className={`mb-1 small fw-bold text-uppercase ${monthlyRevenue >= forecastData.breakEven ? 'text-success-emphasis' : 'text-warning-emphasis'}`}>
                                {monthlyRevenue >= forecastData.breakEven ? t.safetyMargin : t.salesGap}
                              </p>
                              <p className={`h3 mb-0 ${monthlyRevenue >= forecastData.breakEven ? 'text-success-emphasis' : 'text-warning-emphasis'}`}>
                                €{new Intl.NumberFormat('fi-FI').format(Math.abs(monthlyRevenue - forecastData.breakEven))}
                                {monthlyRevenue >= forecastData.breakEven && forecastData.breakEven > 0 && <span className="fs-6 ms-2">({((monthlyRevenue - forecastData.breakEven) / monthlyRevenue * 100).toFixed(0)}%)</span>}
                              </p>
                           </div>
                        </div>
                      </div>

                      {units > 0 && isFinite(forecastData.breakEven) && monthlyRevenue > 0 && (
                        <div className="p-4 rounded" style={{backgroundColor: 'var(--page-bg)'}}>
                          {(() => {
                            const price = monthlyRevenue / units;
                            const beUnits = Math.ceil(forecastData.breakEven / price);
                            const diffUnits = Math.abs(beUnits - units);
                            const isSafe = units >= beUnits;
                            const progress = Math.min((units / beUnits) * 100, 100);
                            
                            return (
                              <>
                                <div className="d-flex justify-content-between align-items-end mb-3">
                                   <div>
                                      <p className="text-secondary mb-1 fw-bold small text-uppercase">{t.breakEvenUnits}</p>
                                      <p className="display-6 fw-bold mb-0">
                                        {beUnits} <span className="fs-5 text-muted">{t.unitsLabel}</span>
                                      </p>
                                   </div>
                                   <div className="text-end">
                                      <p className="text-secondary mb-1 fw-bold small text-uppercase">{isSafe ? t.aboveBreakEven : t.moreToSell}</p>
                                      <p className={`h3 mb-0 ${isSafe ? 'text-success' : 'text-danger'}`}>
                                         {diffUnits} <span className="fs-6 text-muted">{t.unitsLabel}</span>
                                      </p>
                                   </div>
                                </div>
                                <div className="progress" style={{height: '10px', backgroundColor: '#e9ecef'}}>
                                  <div 
                                    className={`progress-bar ${isSafe ? 'bg-success' : 'bg-warning'}`} 
                                    role="progressbar" 
                                    style={{width: `${progress}%`}}
                                  ></div>
                                </div>
                                <div className="d-flex justify-content-between mt-2 text-muted small fw-bold">
                                  <span>0</span>
                                  <span>{beUnits} {t.unitsLabel}</span>
                                </div>
                              </>
                            );
                          })()}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
            ) : (
              <div className="card border-0 shadow-sm h-100">
                  <div className="card-body d-flex flex-column align-items-center justify-content-center text-center p-5">
                      <h2 className="fw-bold">{t.comingSoonTitle}</h2>
                      <p className="text-muted fs-5">{t.comingSoonMessage(premiumFeaturesList.find(f => f.key === activeView)?.label)}</p>
                  </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
