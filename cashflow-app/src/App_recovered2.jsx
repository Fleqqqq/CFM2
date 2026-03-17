import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation, Routes, Route, Navigate } from 'react-router-dom';
import { Line, Bar } from 'react-chartjs-2';
import { loadStripe } from '@stripe/stripe-js';
import { FunctionsHttpError } from '@supabase/supabase-js';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

import Welcome from './Welcome.jsx';
import Overview from './Overview.jsx';
import ProfileSettings from './ProfileSettings.jsx';
import CookiePolicy from './CookiePolicy.jsx';
import PrivacyPolicy from './PrivacyPolicy.jsx';
import PatchNotes from './PatchNotes.jsx';
import Support from './Support.jsx';
import Customers from './Customers.jsx';
import History from './History.jsx';
import Loans from './Loans.jsx';
import { formatForInput, parseFromInput } from './utils.js';
import { api } from './api.js';
import { supabase } from './supabase.js';

// TODO: Replace with your Stripe publishable key from your Stripe Dashboard
const stripePromise = loadStripe('pk_live_51T7XJrQYTuzAHsGJRWQDCXXovLybbulvPZ04aZueQEfRYsrNn3RzhWZr2GA1ObOh23fPpfOwRGh20qltD8VWjTRf00lKLxAUTY');

const translations = {
  fi: {
    // General
    title: 'Kassavirtalaskuri',
    language: 'Kieli',
    english: 'English',
    finnish: 'Suomi',
    newProject: 'Tuo yritys',
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
    support: 'Asiakaspalvelu',
    subject: 'Aihe',
    message: 'Viesti',
    sendRequest: 'Lähetä pyyntö',
    requestSent: 'Pyyntö lähetetty!',
    supportMessageSent: 'Kiitos yhteydenotostasi. Palaamme asiaan pian.',
    return: 'Palaa',
    features: 'Ominaisuudet',
    comingSoonTitle: 'Tulossa pian!',
    comingSoonMessage: (feature) => `Ominaisuus "${feature}" on rakenteilla.`,
    upgradeForFeature: 'Tämä on premium-ominaisuus. Päivitä käyttääksesi sitä.',

    // Dashboard inputs
    inputs: 'Syötteet',
    easyTab: 'Yksinkertainen',
    advancedTab: 'Laajennettu',
    reset: 'Nollaa',
    monthlyIncome: 'Kuukausittaiset tulot',
    monthlyCosts: 'Kuukausittaiset kulut',
    loanPayment: 'Lainojen kuukausierät',
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
    unitEconomics: 'Yksikkötalous',
    // Dashboard Advanced Inputs
    oneTimeEvents: 'Kertaluonteiset tapahtumat (seuraava kk)',
    income: 'Tulot',
    recurringCosts: 'Toistuvat kulut',
    assumptions: 'Oletukset',
    tooltips: {
      cashBalance: 'Rahamäärä pankkitililläsi tällä hetkellä.',
      monthlyRevenue: 'Arvioitu myyntitulo kuukaudessa.',
      fixedCosts: 'Kulut jotka pysyvät samoina (vuokra, vakuutukset).',
      variableCosts: 'Kulut jotka muuttuvat myynnin mukaan (materiaalit, kuljetus).',
      loanPayment: 'Kuukausittainen lainanlyhennys.',
      oneTimeRevenue: 'Satunnainen tulo (esim. laitemyynti) ensi kuussa.',
      oneTimeCost: 'Satunnainen meno (esim. uusi tietokone) ensi kuussa.',
      revenueGrowth: 'Oletettu kuukausittainen myynnin kasvuprosentti.',
      predictionTab: 'Ennuste näyttää kassavirran kehityksen valitulla aikavälillä.',
      breakEvenTab: 'Nollakohta kertoo kuinka paljon sinun täytyy myydä kattaaksesi kulut.',
    },

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

    // Financial Diagnosis
    diagnosis: {
      title: 'Talousdiagnoosi',
      healthyTitle: 'Yrityksesi voi hyvin',
      healthyDesc: 'Tulot kattavat kulut ja yritys tekee voittoa. Jatka samaan malliin!',
      runway: (months) => `Nykyisellä vauhdilla kassasi loppuu ${months} kuukaudessa. Yritys ei tuota tarpeeksi voittoa toiminnan ylläpitämiseksi.`,
      loss: (amount) => `Yrityksesi tekee tällä hetkellä ${new Intl.NumberFormat('fi-FI', { style: 'currency', currency: 'EUR' }).format(amount)} tappiota kuukaudessa, koska tulot ovat pienemmät kuin kokonaiskulut. Tarvitset tämän verran lisää myyntiä tai pienemmät kulut päästäksesi nollatulokseen.`,
      fixedCosts: (percent) => `Kiinteät kulut ovat ${percent}% liikevaihdostasi. Tämä luo suuren riskin, jos myyntisi laskee.`,
      customers: (current, needed, diff) => `Sinulla on nyt ${current} asiakasta, mutta tarvitset ${needed} päästäksesi omillesi. Tarvitset ${diff} asiakasta lisää.`,
      temporaryShortfall: (months) => `Nykyinen tulos on tappiollinen, mutta ennusteen mukaan yritys kääntyy voitolliseksi ${months} kuukauden kuluessa. Hinnanmuutoksia ei tarvita juuri nyt.`,
      adjustPrice: (price) => `Aseta hinnaksi ${new Intl.NumberFormat('fi-FI', { style: 'currency', currency: 'EUR' }).format(price)} (Nollatulos)`,
    },

    // History
    history: {
      title: 'Historia & Trendit',
      addEntry: 'Lisää kuukausitiedot',
      date: 'Kuukausi',
      revenue: 'Liikevaihto',
      fixedCosts: 'Kiinteät kulut',
      variableCosts: 'Muuttuvat kulut',
      totalCosts: 'Kokonaiskulut',
      cashBalance: 'Kassavarat',
      customers: 'Asiakkaat',
      noData: 'Ei historiatietoja vielä.',
      save: 'Tallenna',
      delete: 'Poista',
      trend: 'Trendi',
      sort: 'Järjestä',
      sortDateNewest: 'Uusin ensin',
      sortDateOldest: 'Vanhin ensin',
      sortRevenueHigh: 'Liikevaihto (Suurin)',
      sortRevenueLow: 'Liikevaihto (Pienin)',
      confirmDelete: 'Haluatko varmasti poistaa tämän kirjauksen?',
    },

    // Loans
    loans: {
      title: 'Lainat',
      addLoan: 'Lisää laina',
      editLoan: 'Muokkaa lainaa',
      name: 'Nimi',
      balance: 'Saldo',
      interest: 'Korko',
      payment: 'Kuukausierä',
      perMonth: '/kk',
      noLoans: 'Ei lainoja vielä.',
      delete: 'Poista',
      payoffTimeline: 'Lainan takaisinmaksuaikataulu',
      totalBalance: 'Lainasumma yhteensä',
      weightedAverageRate: (rate) => `Painotettu keskikorko: ${rate}%`,
      summaryTotalBalance: 'Lainat yhteensä',
      summaryMonthlyPayment: 'Kuukausierä',
      summaryAvgInterest: 'Keskikorko',
      summaryPayoffDate: 'Velaton',
      summaryTotalInterest: 'Korkokulut yht.',
      sort: 'Järjestä',
      sortBalanceDesc: 'Saldo (Suurin ensin)',
      sortBalanceAsc: 'Saldo (Pienin ensin)',
      sortInterestDesc: 'Korko (Suurin ensin)',
      sortInterestAsc: 'Korko (Pienin ensin)',
      sortName: 'Nimi',
      confirmDelete: 'Haluatko varmasti poistaa tämän lainan?',
    },

    // Welcome page
    customers: {
      title: 'Hallitse asiakkaita',
      addCustomer: 'Lisää asiakas',
      editCustomer: 'Muokkaa asiakasta',
      name: 'Nimi',
      email: 'Sähköposti',
      date: 'Päivämäärä',
      status: 'Tila',
      sortNewest: 'Uusimmat',
      sortNearest: 'Lähin tapahtuma',
      sortNameAsc: 'Nimi (A-Ö)',
      sortNameDesc: 'Nimi (Ö-A)',
      done: 'Valmis',
      notDone: 'Ei valmis',
      noCustomers: 'Ei asiakkaita vielä.',
      search: 'Hae...',
      noResults: 'Ei tuloksia.',
      delete: 'Poista',
      confirmDelete: 'Haluatko varmasti poistaa tämän asiakkaan?',
      filterAll: 'Kaikki',
      sort: 'Järjestä',
      filter: 'Suodata',
      deleteSelected: 'Poista valitut',
      confirmDeleteSelected: 'Haluatko varmasti poistaa valitut asiakkaat?',
      selected: 'valittu',
      selectAll: 'Valitse kaikki',
    },
    welcome: {
      title: 'Tervetuloa',
      subtitle: 'Mitä haluat tehdä?',
      own: 'Tuo yritys',
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
      premiumFeature4: 'Tietojen vienti (CSV)',
      premiumFeature5: 'Historia & Trendit',
      premiumFeature6: 'Hallitse asiakkaita',
      premiumFeature7: 'Hallitse lainoja',
      upgradeToPremium: 'Päivitä Premiumiin',
      discountCode: 'Alennuskoodi',
      redeem: 'Lunasta',
      codeSuccess: 'Koodi lunastettu onnistuneesti!',
      codeInvalid: 'Virheellinen alennuskoodi.',
      premiumActivated: 'Premium aktivoitu',
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
    newProject: 'Import Business',
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
    support: 'Customer Service',
    subject: 'Subject',
    message: 'Message',
    sendRequest: 'Send Request',
    requestSent: 'Request Sent!',
    supportMessageSent: 'Thank you for contacting us. We will get back to you shortly.',
    return: 'Return',
    features: 'Features',
    comingSoonTitle: 'Coming Soon!',
    comingSoonMessage: (feature) => `The "${feature}" feature is under construction.`,
    upgradeForFeature: 'This is a premium feature. Please upgrade to use it.',

    // Dashboard inputs
    inputs: 'Inputs',
    easyTab: 'Easy',
    advancedTab: 'Advanced',
    reset: 'Reset',
    monthlyIncome: 'Monthly Income',
    monthlyCosts: 'Monthly Costs',
    loanPayment: 'Total Loan Payments / month',
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
    unitEconomics: 'Unit Economics',
    // Dashboard Advanced Inputs
    oneTimeEvents: 'One-Time Events (in next month)',
    income: 'Income',
    recurringCosts: 'Recurring Costs',
    assumptions: 'Assumptions',
    tooltips: {
      cashBalance: 'The amount of money currently in your bank account.',
      monthlyRevenue: 'Estimated sales income per month.',
      fixedCosts: 'Costs that stay the same (rent, insurance).',
      variableCosts: 'Costs that vary with sales (materials, shipping).',
      loanPayment: 'Monthly loan repayment amount.',
      oneTimeRevenue: 'One-off income (e.g. selling equipment) in the next month.',
      oneTimeCost: 'One-off expense (e.g. new laptop) in the next month.',
      revenueGrowth: 'Assumed monthly percentage growth in sales.',
      predictionTab: 'Forecast shows cash flow development over the selected time period.',
      breakEvenTab: 'Break-even point tells you how much you need to sell to cover your costs.',
    },

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

    // Financial Diagnosis
    diagnosis: {
      title: 'Financial Diagnosis',
      healthyTitle: 'Business is Healthy',
      healthyDesc: 'Revenue covers costs and you are generating profit. Keep it up!',
      runway: (months) => `At your current pace, your cash will run out in ${months} months. The business is not generating enough profit to sustain operations.`,
      loss: (amount) => `Your business is currently losing ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EUR' }).format(amount)} per month because revenue is lower than your total costs. You need this much more monthly sales or lower costs to break even.`,
      fixedCosts: (percent) => `Fixed costs represent ${percent}% of your revenue. This creates high risk if your sales decrease.`,
      customers: (current, needed, diff) => `You currently have ${current} customers, but need ${needed} to break even. You need ${diff} more customers.`,
      temporaryShortfall: (months) => `Current profit is negative, but the forecast shows the business will turn profitable in ${months} months. No price adjustments are needed at this time.`,
      adjustPrice: (price) => `Set price to ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EUR' }).format(price)} (Break-even)`,
    },

    // History
    history: {
      title: 'History & Trends',
      addEntry: 'Add Monthly Data',
      date: 'Month',
      revenue: 'Revenue',
      fixedCosts: 'Fixed Costs',
      variableCosts: 'Variable Costs',
      totalCosts: 'Total Costs',
      cashBalance: 'Cash Balance',
      customers: 'Customers',
      noData: 'No historical data yet.',
      save: 'Save',
      delete: 'Delete',
      trend: 'Trend',
      sort: 'Sort',
      sortDateNewest: 'Newest First',
      sortDateOldest: 'Oldest First',
      sortRevenueHigh: 'Revenue (High-Low)',
      sortRevenueLow: 'Revenue (Low-High)',
      confirmDelete: 'Are you sure you want to delete this entry?',
    },

    // Loans
    loans: {
      title: 'Loans',
      addLoan: 'Add Loan',
      editLoan: 'Edit Loan',
      name: 'Name',
      balance: 'Balance',
      interest: 'Interest Rate',
      payment: 'Monthly Payment',
      perMonth: '/mo',
      noLoans: 'No loans yet.',
      delete: 'Delete',
      payoffTimeline: 'Loan Payoff Timeline',
      totalBalance: 'Total Loan Balance',
      weightedAverageRate: (rate) => `Weighted average rate: ${rate}%`,
      summaryTotalBalance: 'Total Balance',
      summaryMonthlyPayment: 'Monthly Payment',
      summaryAvgInterest: 'Avg. Interest',
      summaryPayoffDate: 'Debt Free By',
      summaryTotalInterest: 'Total Interest Cost',
      sort: 'Sort',
      sortBalanceDesc: 'Balance (High-Low)',
      sortBalanceAsc: 'Balance (Low-High)',
      sortInterestDesc: 'Interest (High-Low)',
      sortInterestAsc: 'Interest (Low-High)',
      sortName: 'Name',
      confirmDelete: 'Are you sure you want to delete this loan?',
    },

    // Welcome page
    customers: {
      title: 'Manage Customers',
      addCustomer: 'Add Customer',
      editCustomer: 'Edit Customer',
      name: 'Name',
      email: 'Email',
      date: 'Date',
      status: 'Status',
      sortNewest: 'Newest',
      sortNearest: 'Nearest happening',
      sortNameAsc: 'Name (A-Z)',
      sortNameDesc: 'Name (Z-A)',
      done: 'Done',
      notDone: 'Not done',
      noCustomers: 'No customers yet.',
      search: 'Search...',
      noResults: 'No results found.',
      delete: 'Delete',
      confirmDelete: 'Are you sure you want to delete this customer?',
      filterAll: 'All',
      sort: 'Sort',
      filter: 'Filter',
      deleteSelected: 'Delete Selected',
      confirmDeleteSelected: 'Are you sure you want to delete selected customers?',
      selected: 'selected',
      selectAll: 'Select All',
    },
    welcome: {
      title: 'Welcome',
      subtitle: 'What would you like to do?',
      own: 'Import Business',
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
      premiumFeature4: 'Data export (CSV)',
      premiumFeature5: 'History & Trends',
      premiumFeature6: 'Manage Customers',
      premiumFeature7: 'Manage Loans',
      upgradeToPremium: 'Upgrade to Premium',
      discountCode: 'Discount code',
      redeem: 'Redeem',
      codeSuccess: 'Code redeemed successfully!',
      codeInvalid: 'Invalid discount code.',
      premiumActivated: 'Premium Activated',
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

const FinancialDiagnosis = ({ monthlyRevenue, fixedCosts, variableCosts, cashBalance, units, revenueGrowth, language, onApplySuggestion }) => {
  const t = translations[language];
  const totalCosts = fixedCosts + variableCosts;
  const monthlyProfit = monthlyRevenue - totalCosts;
  const burnRate = -monthlyProfit;
  
  // Check for temporary shortfall (Business turns profitable within 12 months)
  if (monthlyProfit < 0) {
    const variableCostRatio = monthlyRevenue > 0 ? variableCosts / monthlyRevenue : 0;
    let currentRev = monthlyRevenue;
    let turnsProfitableIn = -1;

    for (let i = 1; i <= 12; i++) {
      currentRev = currentRev * (1 + (revenueGrowth || 0) / 100);
      const futureVarCost = currentRev * variableCostRatio;
      const futureTotalCost = fixedCosts + futureVarCost;
      const futureProfit = currentRev - futureTotalCost;

      if (futureProfit > 0) {
        turnsProfitableIn = i;
        break;
      }
    }

    if (turnsProfitableIn !== -1) {
      return (
        <div className="card border-0 shadow-sm mt-4" style={{backgroundColor: 'var(--surface-bg)', borderRadius: '16px'}}>
            <div className="card-body">
                <h5 className="card-title fw-bold mb-3">{t.diagnosis.title}</h5>
                <div className="alert alert-info border-0 mb-0 shadow-sm">
                    {t.diagnosis.temporaryShortfall(turnsProfitableIn)}
                </div>
            </div>
        </div>
      );
    }
  }

  const issues = [];

  // 1. Cash Runway (Risk of running out)
  if (monthlyProfit < 0 && cashBalance > 0) {
    const monthsLeft = burnRate > 0 ? Math.floor(cashBalance / burnRate) : 0;
    if (monthsLeft < 6) {
       issues.push({
         type: 'danger',
         msg: t.diagnosis.runway(monthsLeft)
       });
    }
  } else if (monthlyProfit < 0 && cashBalance <= 0) {
      issues.push({
         type: 'danger',
         msg: t.diagnosis.runway(0)
       });
  }

  // 2. Monthly Loss (Profitability)
  if (monthlyProfit < 0) {
    let action = null;
    if (units > 0 && onApplySuggestion) {
        const breakEvenRevenue = fixedCosts + variableCosts;
        const breakEvenPrice = breakEvenRevenue / units;
        if (breakEvenPrice > (monthlyRevenue / units)) {
             action = {
                 label: t.diagnosis.adjustPrice(breakEvenPrice),
                 handler: () => onApplySuggestion(breakEvenPrice)
             };
        }
    }

    issues.push({
      type: 'warning',
      msg: t.diagnosis.loss(Math.abs(monthlyProfit)),
      action
    });
  }

  // 3. High Fixed Costs
  if (monthlyRevenue > 0) {
    const fixedRatio = fixedCosts / monthlyRevenue;
    if (fixedRatio > 0.6) {
      issues.push({
        type: 'warning',
        msg: t.diagnosis.fixedCosts((fixedRatio * 100).toFixed(0))
      });
    }
  }

  // 4. Customers (Break even)
  if (units > 0 && monthlyRevenue > 0) {
      const pricePerUnit = monthlyRevenue / units;
      const varCostPerUnit = variableCosts / units;
      const contributionMargin = pricePerUnit - varCostPerUnit;
      
      if (contributionMargin > 0) {
          const breakEvenUnits = Math.ceil(fixedCosts / contributionMargin);
          if (units < breakEvenUnits) {
             issues.push({
                 type: 'info',
                 msg: t.diagnosis.customers(units, breakEvenUnits, breakEvenUnits - units)
             });
          }
      }
  }

  const topIssues = issues.slice(0, 3);

  if (topIssues.length === 0 && monthlyProfit > 0) {
      return (
          <div className="alert alert-success border-0 shadow-sm d-flex align-items-center mt-4">
              <div className="fw-medium">
                  <strong>{t.diagnosis.healthyTitle}</strong><br/>
                  {t.diagnosis.healthyDesc}
              </div>
          </div>
      );
  } else if (topIssues.length === 0) {
      return null;
  }

  return (
    <div className="card border-0 shadow-sm mt-4" style={{backgroundColor: 'var(--surface-bg)', borderRadius: '16px'}}>
        <div className="card-body">
            <h5 className="card-title fw-bold mb-3">{t.diagnosis.title}</h5>
            <div className="d-flex flex-column gap-2">
                {topIssues.map((issue, idx) => (
                    <div key={idx} className={`alert alert-${issue.type} border-0 mb-0 shadow-sm`}>
                        <div>{issue.msg}</div>
                        {issue.action && (
                            <button className="btn btn-sm btn-dark mt-2" onClick={issue.action.handler}>
                                {issue.action.label}
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    </div>
  );
};

const InfoTooltip = ({ text }) => {
  const [show, setShow] = useState(false);

  return (
    <span 
      className="ms-1 text-muted opacity-75 position-relative" 
      style={{ cursor: 'pointer', verticalAlign: 'text-bottom' }}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="16" x2="12" y2="12"></line>
        <line x1="12" y1="8" x2="12.01" y2="8"></line>
      </svg>
      {show && (
        <div className="position-absolute p-2 rounded shadow-sm" style={{ backgroundColor: 'var(--surface-bg)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', zIndex: 1000, bottom: '100%', left: '50%', transform: 'translateX(-50%)', marginBottom: '0.5rem', width: 'max-content', maxWidth: '200px', fontSize: '0.75rem', fontWeight: 'normal', lineHeight: 1.4, textAlign: 'center', pointerEvents: 'none', animation: 'fadeInTooltip 0.2s ease-out' }}>
          {text}
          <div style={{
            position: 'absolute',
            top: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            borderLeft: '6px solid transparent',
            borderRight: '6px solid transparent',
            borderTop: '6px solid var(--border-color)'
          }}></div>
        </div>
      )}
    </span>
  );
};

const Footer = ({ onOpenPage, t }) => (
  <footer className="py-5 mt-5 text-center">
    <div className="d-flex justify-content-center gap-4">
      <a href="https://x.com/rahantofinland" target="_blank" rel="noopener noreferrer" className="text-muted" title="X (Twitter)">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 7.693 6.064-7.693ZM17.61 20.644h2.039L6.486 3.24H4.298l13.312 17.404Z"/></svg>
      </a>
      <a href="https://www.instagram.com/rahantofinland/" target="_blank" rel="noopener noreferrer" className="text-muted" title="Instagram">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
      </a>
      <a href="https://www.tiktok.com/@rahanto" target="_blank" rel="noopener noreferrer" className="text-muted" title="TikTok">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.82-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.35-1.17.82-1.51 1.43-.72 1.13-.56 2.72.37 3.67.95 1.07 2.62 1.37 3.82.69 1.18-.63 1.95-1.87 1.95-3.26.03-5.38.02-10.76.04-16.14z"/></svg>
      </a>
    </div>
    <div className="d-flex justify-content-center gap-3 mt-3">
      <button className="btn btn-link text-muted text-decoration-none small p-0" onClick={() => onOpenPage('cookie-policy')}>{t?.cookiePolicy || 'Cookie Policy'}</button>
      <span className="text-muted small">&bull;</span>
      <button className="btn btn-link text-muted text-decoration-none small p-0" onClick={() => onOpenPage('privacy-policy')}>{t?.privacyPolicy || 'Privacy Policy'}</button>
      <span className="text-muted small">&bull;</span>
      <button className="btn btn-link text-muted text-decoration-none small p-0" onClick={() => onOpenPage('patch-notes')}>{t?.patchNotes || 'Patch Notes'}</button>
    </div>
    <p className="text-muted mt-4 small">&copy; {new Date().getFullYear()} Rahanto. All Rights Reserved.</p>
  </footer>
);

  const globalStyles = `
    :root {
      --primary-color: #16a34a; /* Green for Light Mode */
      --primary-rgb: 22, 163, 74;
      --secondary-color: #737373;

      --app-bg: #ffffff;
      --surface-bg: #fafafa;
      --text-primary: #171717;
      --text-secondary: #737373;
      --border-color: #e5e5e5;
      --input-bg: #ffffff;
      --highlight-bg: #f5f5f5;
      --chart-grid: #f5f5f5;
      --chart-text: #737373;
      --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
    }

    [data-bs-theme="dark"] {
      --primary-color: #22c55e; /* Green for Dark Mode */
      --primary-rgb: 34, 197, 94;
      --secondary-color: #737373;

      --app-bg: #0a0a0a; /* Darker neutral gray (near black) */
      --surface-bg: #171717; /* Dark neutral gray */
      --text-primary: #f5f5f5;
      --text-secondary: #a3a3a3;
      --border-color: #262626;
      --input-bg: #0a0a0a;
      --highlight-bg: #262626;
      --chart-grid: #262626;
      --chart-text: #a3a3a3;
      
      --bs-body-bg: var(--app-bg);
      --bs-body-color: var(--text-primary);
      --bs-border-color: var(--border-color);
      --bs-primary: var(--primary-color);
      --bs-primary-rgb: var(--primary-rgb);
      --bs-btn-bg: var(--primary-color);
      --bs-btn-border-color: var(--primary-color);
      --bs-btn-hover-bg: var(--primary-color);
      --bs-btn-hover-border-color: var(--primary-color);
    }

    body { background-color: var(--app-bg); color: var(--text-primary); }
    .card, .sidebar, .modal-content, .dropdown-menu, .pricing-card, .project-card { background-color: var(--surface-bg); border-color: var(--border-color); color: var(--text-primary); }
    .form-control, .form-select, .input-group-text { background-color: var(--input-bg); border-color: var(--border-color); color: var(--text-primary); }
    .form-control:focus { background-color: var(--input-bg); color: var(--text-primary); border-color: var(--primary-color); box-shadow: 0 0 0 0.25rem rgba(var(--primary-rgb), 0.25); }
    .text-muted, .text-secondary { color: var(--text-secondary) !important; }
    .btn-white { background-color: var(--surface-bg); border-color: var(--border-color); color: var(--text-primary); }
    .btn-white:hover { background-color: var(--highlight-bg); border-color: var(--border-color); color: var(--text-primary); }
    .nav-logo { color: var(--text-primary); }
    .welcome-container { background-color: var(--app-bg); color: var(--text-primary); }
    .question-title { color: var(--text-primary); }
    
    /* Primary Button & Text Overrides */
    .btn-primary { background-color: var(--primary-color); border-color: var(--primary-color); }
    .btn-primary:hover { opacity: 0.9; background-color: var(--primary-color); border-color: var(--primary-color); }
    .text-primary { color: var(--primary-color) !important; }
    .bg-primary-subtle { background-color: rgba(var(--primary-rgb), 0.1) !important; }
    .text-primary-emphasis { color: var(--primary-color) !important; }
    .border-primary-subtle { border-color: rgba(var(--primary-rgb), 0.2) !important; }
    
    /* --- Pagination Customization --- */
    .pagination {
      --bs-pagination-padding-x: 0.75rem;
      --bs-pagination-padding-y: 0.375rem;
      --bs-pagination-font-size: 0.875rem;
      --bs-pagination-color: var(--text-secondary);
      --bs-pagination-bg: transparent;
      --bs-pagination-border-width: 0;
      --bs-pagination-border-radius: 0.5rem;
      --bs-pagination-hover-color: var(--text-primary);
      --bs-pagination-hover-bg: var(--highlight-bg);
      --bs-pagination-hover-border-color: transparent;
      --bs-pagination-focus-color: var(--primary-color);
      --bs-pagination-focus-bg: var(--highlight-bg);
      --bs-pagination-focus-box-shadow: 0 0 0 0.25rem rgba(var(--primary-rgb), 0.25);
      --bs-pagination-active-color: #fff;
      --bs-pagination-active-bg: var(--primary-color);
      --bs-pagination-active-border-color: var(--primary-color);
      --bs-pagination-disabled-color: var(--text-secondary);
      --bs-pagination-disabled-bg: transparent;
      --bs-pagination-disabled-border-color: transparent;
      gap: 0.25rem;
    }
    .page-item .page-link {
      border-radius: var(--bs-pagination-border-radius) !important; /* Override bootstrap specificity */
      font-weight: 600;
      transition: all 0.2s ease;
    }
    .page-item.active .page-link { box-shadow: var(--shadow-sm); }
    .page-item.disabled .page-link { opacity: 0.5; }

    .top-nav {
      background-color: var(--surface-bg);
      border-bottom: 1px solid var(--border-color);
      padding: 0.75rem 1.5rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      position: sticky;
      top: 0;
      z-index: 1000;
    }

    .app-wrapper { display: grid; grid-template-columns: 240px 1fr; gap: 1.5rem; align-items: start; }
    .sidebar { border-radius: 0.75rem; padding: 1rem; box-shadow: 0 1px 3px rgba(0,0,0,0.05); position: sticky; top: 1rem; }
    .dashboard-grid { display: grid; grid-template-columns: 350px 1fr; gap: 1rem; }
    .nav-item-custom { display: block; padding: 0.6rem 1rem; color: var(--text-primary); text-decoration: none; border-radius: 0.5rem; margin-bottom: 0.25rem; transition: all 0.2s; font-weight: 500; }
    .nav-item-custom:hover { background-color: var(--highlight-bg); color: var(--text-primary); }
    .nav-item-custom.active { background-color: rgba(var(--primary-rgb), 0.1); color: var(--primary-color); }
    @keyframes fadeInTooltip { from { opacity: 0; transform: translateX(-50%) translateY(5px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }

    /* --- Pricing Section --- */
    .pricing-section {
      padding: 6rem 0;
      background-color: var(--surface-bg);
    }
    .pricing-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2.5rem;
      align-items: start;
      max-width: 850px;
      margin: 0 auto;
    }
    .pricing-card {
      padding: 2.5rem;
      border-radius: 1rem;
      display: flex;
      flex-direction: column;
      height: 100%;
      box-shadow: var(--shadow-sm);
      transition: all 0.2s ease-in-out;
      text-align: center;
      border: 2px solid transparent;
    }
    .pricing-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 4px 12px rgba(0,0,0,0.08);
    }
    .pricing-card.recommended {
      border-color: var(--primary-color);
      position: relative;
      transform: scale(1.02);
    }
    .pricing-card.recommended:hover {
        transform: scale(1.02) translateY(-5px);
    }
    .recommended-badge {
      position: absolute;
      top: 0;
      left: 50%;
      transform: translate(-50%, -50%);
      background-color: var(--primary-color);
      color: white;
      padding: 0.25rem 0.75rem;
      border-radius: 99px;
      font-size: 0.8rem;
      font-weight: bold;
      white-space: nowrap;
    }
    .pricing-card h3 { font-weight: bold; margin-bottom: 1.5rem; }
    .price { font-size: 3rem; font-weight: bold; margin-bottom: 0.5rem; color: var(--text-primary); }
    .price-period { font-size: 1rem; font-weight: normal; color: var(--text-secondary); margin-left: 0.5rem; }
    .price-desc { color: var(--text-secondary); min-height: 40px; margin-bottom: 1.5rem; }
    .price-annual { color: var(--text-secondary); font-size: 0.9rem; margin-top: -0.5rem; margin-bottom: 1.5rem; }
    .features-list {
      list-style: none;
      padding: 0;
      margin: 1.5rem 0;
      text-align: left;
    }
    .features-list li { margin-bottom: 1rem; }

    @media (max-width: 1200px) { .dashboard-grid { grid-template-columns: 1fr; } }
    @media (max-width: 992px) { 
      .app-wrapper { grid-template-columns: 1fr; } 
      .sidebar { position: static; margin-bottom: 1rem; } 
      main.p-4 { padding: 1rem !important; }
      .top-nav {
        flex-wrap: wrap;
        gap: 1rem;
      }
      .nav-actions {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        width: 100%;
      }
      .hero-section .display-4 {
        font-size: calc(1.425rem + 2.1vw); /* Closer to display-5 on mobile */
        line-height: 1.2;
      }
      .pricing-grid {
        /* Assuming this was a 2-column grid, stack it on mobile */
        grid-template-columns: 1fr;
      }
    }
  `;

function App() {
  const [language, setLanguage] = useState(() => {
    try {
      return localStorage.getItem('language') || 'en';
    } catch {
      return 'en';
    }
  });
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem('theme') || 'light';
    } catch {
      return 'light';
    }
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-bs-theme', theme);
    try { localStorage.setItem('theme', theme); } catch {}
  }, [theme]);
  const t = translations[language];
  const [cashBalance, setCashBalance] = useState(10000);

  const [monthlyRevenue, setMonthlyRevenue] = useState(5000);
  const [fixedCosts, setFixedCosts] = useState(2000);
  const [variableCosts, setVariableCosts] = useState(1500);
  const [revenueGrowth, setRevenueGrowth] = useState(0);
  const [forecastData, setForecastData] = useState({
    projection: [],
    revenueProjection: [],
    breakEven: 0,
  });
  const [activeTab, setActiveTab] = useState('prediction');
  const [inputMode, setInputMode] = useState('easy');
  const [showUnitEconomics, setShowUnitEconomics] = useState(true);
  const [showCashFlow, setShowCashFlow] = useState(true);
  const [showRevenue, setShowRevenue] = useState(true);
  const [chartType, setChartType] = useState('line');
  const [units, setUnits] = useState(100);
  const [unitPrice, setUnitPrice] = useState(0);
  const [unitCost, setUnitCost] = useState(0);
  const [highlightMonthlyRevenue, setHighlightMonthlyRevenue] = useState(false);
  const [highlightUnitPrice, setHighlightUnitPrice] = useState(false);
  const [oneTimeRevenue, setOneTimeRevenue] = useState(0);
  const [oneTimeCost, setOneTimeCost] = useState(0);
  const [timeline, setTimeline] = useState('1y');
  const [showProjectManager, setShowProjectManager] = useState(false);
  const [isCreatingNewProject, setIsCreatingNewProject] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState(null);
  const [activePage, setActivePage] = useState('welcome');
  const [showSupport, setShowSupport] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
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
  const navigate = useNavigate();
  const location = useLocation();
  const activeView = location.pathname === '/' ? 'dashboard' : location.pathname.substring(1);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [projectsLoaded, setProjectsLoaded] = useState(false);

  const handleResetInputs = () => {
    setCashBalance(0);
    setMonthlyRevenue(0);
    setFixedCosts(0);
    setVariableCosts(0);
    setRevenueGrowth(0);
    setUnits(0);
    setUnitPrice(0);
    setUnitCost(0);
    setOneTimeRevenue(0);
    setOneTimeCost(0);
  };

  // Handle redirect from Stripe Checkout
  useEffect(() => {
    const query = new URLSearchParams(window.location.search);

    if (query.get('payment') === 'success' && user) {
      console.log('Payment successful! Upgrading account.');
      // This is an optimistic update for immediate UI feedback.
      // A webhook is the source of truth for the backend in a real app.
      if (!user.isPremium) handleUpgradeToPremium();
      setShowPaymentSuccess(true);
      // Clean up the URL to avoid re-triggering on refresh
      window.history.replaceState({}, document.title, "/");
    }

    if (query.get('payment') === 'cancel') {
      console.log('Payment canceled.');
      // Clean up the URL
      window.history.replaceState({}, document.title, "/");
    }
  }, [user]); // Rerun when user is loaded after redirect

  const handleRedirectToCheckout = async () => {
    if (!user) {
      alert("Please log in to upgrade.");
      return;
    }

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;

      if (!token) {
        alert("Session expired. Please log in again.");
        await handleLogout();
        setShowLoginModal(true);
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();

const { data, error } = await supabase.functions.invoke('create-checkout-session', {
  body: { userId: user.email, email: user.email },
  headers: {
    Authorization: `Bearer ${session?.access_token}`,
  },
});

      if (error) {
        // Attempt to recover URL from error body if present
        if (error instanceof FunctionsHttpError) {
          try {
            // Clone response to avoid "body stream already read" errors
            const errorBody = await error.context.clone().json();
            if (errorBody && errorBody.url) {
              window.location.href = errorBody.url;
              return;
            }
            
            const errorMessage = errorBody?.error || error.message;
            const errorDetails = errorBody?.details ? JSON.stringify(errorBody.details) : '';

            if (error.context.status === 401) {
              console.error("Payment Auth Error:", errorMessage, errorDetails);
              alert(`Authentication failed: ${errorMessage} ${errorDetails}. Please log in again.`);
              handleLogout();
              setShowLoginModal(true);
              return;
            }
            throw new Error(errorMessage);
          } catch (e) {
            // Ignore JSON parse errors
          }
        }
        throw error;
      }

      if (data?.url) window.location.href = data.url;
      else if (data?.error) throw new Error(data.error);

    } catch (error) {
      console.error('Payment failed:', error);
      alert(`Payment failed: ${error.message}`);
    }
  };

  // Projects state: list of all projects
  const [projects, setProjects] = useState([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);

  const [activeProjectId, setActiveProjectId] = useState(null);

 useEffect(() => {
  supabase.auth.getSession().then(({ data: { session } }) => {
    if (session?.user) {
      setShowLoginModal(false);
      if (!user) {
        setUser({
          email: session.user.email,
          name: session.user.user_metadata?.name || session.user.email,
          isPremium: session.user.user_metadata?.isPremium || false,
        });
      }
} else {
      localStorage.removeItem('user');
      sessionStorage.removeItem('user');
      setShowLoginModal(true);
    }
  });

  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    if (session?.user) {
      setUser(prev => prev || {
        email: session.user.email,
        name: session.user.user_metadata?.name || session.user.email,
        isPremium: session.user.user_metadata?.isPremium || false,
      });
    }
  });

  return () => subscription.unsubscribe();
}, []);

 useEffect(() => {
    if (user && isInitialized && projectsLoaded) {
      const timer = setTimeout(() => {
        api.saveProjects(user, projects).catch(console.error);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [projects, user, isInitialized, projectsLoaded]);

 useEffect(() => {
    if (user) {
      setIsLoadingProjects(true);
      api.getProjects(user).then(data => {
        console.log('Loaded projects:', data);
        setProjects(data);
        setProjectsLoaded(true);
        setIsInitialized(true);
        setIsLoadingProjects(false);
      }).catch(err => {
        console.error('Load error:', err);
        setProjectsLoaded(true);
        setIsInitialized(true);
        setIsLoadingProjects(false);
      });
    } else {
      setProjects([]);
      setActiveProjectId(null);
      setProjectsLoaded(false);
      setIsInitialized(true);
    }
  }, [user?.email]);

  // Persist projects and active ID

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

  const loanInfo = useMemo(() => {
    if (!activeProject?.loans || activeProject.loans.length === 0) {
      return { totalPayment: 0, weightedRate: 0 };
    }
    const loans = activeProject.loans;
    const totalPayment = loans.reduce((sum, loan) => sum + (Number(loan.monthlyPayment) || 0), 0);
    const totalBalance = loans.reduce((sum, loan) => sum + (Number(loan.balance) || 0), 0);
    
    if (totalBalance <= 0) {
      return { totalPayment, weightedRate: 0 };
    }

    const totalAnnualInterest = loans.reduce((sum, loan) => {
      const balance = Number(loan.balance) || 0;
      const rate = Number(loan.interestRate) || 0;
      return sum + (balance * (rate / 100));
    }, 0);

    const weightedRate = (totalAnnualInterest / totalBalance) * 100;

    return { totalPayment, weightedRate };
  }, [activeProject?.loans]);

  // Load active project data into inputs when switching projects
  useEffect(() => {
    if (activeProject) {
      setCashBalance(activeProject.initialCash || 0);
      setMonthlyRevenue(activeProject.monthlyRevenue || 0);
      navigate('/'); // Reset to dashboard view when project changes
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

  // Handle URL routing for projects
  useEffect(() => {
    if (!isInitialized) return;
    if (user && !projectsLoaded) return;

    const path = location.pathname;

    if (path === '/projects') {
      setShowProjectManager(true);
      setActiveProjectId(null);
      setIsCreatingNewProject(false);
      setShowOverview(false);
    } else if (path.startsWith('/projects/')) {
      const param = decodeURIComponent(path.substring(10));
      const project = projects.find(p => p.id === param || p.name === param);
      
      if (project) {
        setActiveProjectId(project.id);
        setShowProjectManager(false);
        setShowOverview(false);
      } else {
        navigate('/projects', { replace: true });
      }
    } else if (path === '/' && showProjectManager) {
      setShowProjectManager(false);
    }
  }, [location.pathname, isInitialized, projectsLoaded, projects, user, showProjectManager, navigate]);

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
    navigate('/');
    setShowSupport(false);
  };

  const confirmDeleteProject = async () => {
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

      // Tallenna heti Supabaseen
      try {
        await api.saveProjects(user, remainingProjects);
        console.log('Projects saved after delete:', remainingProjects.length);
      } catch (err) {
        console.error('Save after delete failed:', err);
      }
    }
  };

  const handleNewProject = () => {
    setActiveProjectId(null);
    setIsCreatingNewProject(true); // Indicate that we are starting a new project flow
    navigate('/');
    setShowOverview(false);
    setShowProjectManager(false);
  };

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
      if (error) throw error;
    } catch (error) {
      setLoginError(error.message);
    }
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
        data = await api.signup(emailInput.trim(), passwordInput);
      } else {
        data = await api.login(emailInput.trim(), passwordInput);
      }
      
      const type = rememberMe ? 'local' : 'session';
      setPersistenceType(type);

      const accessToken = data.session?.access_token || data.token;

      if (accessToken) {
        localStorage.removeItem('authToken');
        sessionStorage.removeItem('authToken');
        (type === 'local' ? localStorage : sessionStorage).setItem('authToken', accessToken);
        setUser(data.user);
        setShowLoginModal(false);
      } else if (data.user && authMode === 'signup') {
        setShowConfirmation(true);
      } else if (data.user) {
        setLoginError("Please check your email to confirm your account.");
      }
    } catch (err) {
      setLoginError(err.message || 'Authentication failed');
    } finally {
      setIsAuthenticating(false);
    }
  };

const handleForgotPassword = async () => {
    setLoginError('');
    if (!emailInput) {
      setLoginError(translations[language].enterEmail);
      return;
    }
    try {
      await api.resetPassword(emailInput);
      alert(translations[language].resetLinkSent(emailInput));
      setAuthMode('login');
    } catch (err) {
      setLoginError(err.message);
    }
  };

  const handleAdvancedTabClick = () => {
    if (!user?.isPremium) {
        setShowUpgradeModal(true);
    } else {
        setInputMode('advanced');
    }
  };

  const handleExport = () => {
    if (!user?.isPremium) {
        setShowUpgradeModal(true);
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
      { key: 'customers', label: t.welcome.premiumFeature6 },
      { key: 'assets', label: t.welcome.premiumFeature7 },
  ];

  const handleFeatureClick = (key) => {
      if (!user?.isPremium) {
          setShowUpgradeModal(true);
          return;
      }
      navigate('/' + key);
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
    navigate('/');
    setShowSupport(false);
  };

  const handleDeleteAccount = async () => {
    if (accountToDelete) {
      // Log out the user if they deleted their own account
      if (user && user.email === accountToDelete) {
        handleLogout();
        await api.deleteAccount(accountToDelete);
      }
      
      setAccountToDelete(null);
      navigate('/'); // Close profile settings after deletion
      setShowSupport(false);
      setShowProjectManager(false); // Go back to welcome page
      setShowLoginModal(true); // Show login modal again
      setAuthMode('signup'); // Default to signup after account deletion
    }
  };

  const handleLogout = async () => {
    setUser(null);
    setActiveProjectId(null);
    setShowProjectManager(false);
    setShowOverview(false);
    setShowProfileDropdown(false);
    setShowSupport(false);
    navigate('/');
    localStorage.removeItem('authToken');
    sessionStorage.removeItem('authToken');
    await supabase.auth.signOut();
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

  const handleApplyPriceSuggestion = (newPrice) => {
    setUnitPrice(newPrice);
    setMonthlyRevenue(newPrice * units);
    setHighlightUnitPrice(true);
    setHighlightMonthlyRevenue(true);
    setTimeout(() => {
      setHighlightUnitPrice(false);
      setHighlightMonthlyRevenue(false);
    }, 1000);
  };

  useEffect(() => {
    const variableCostsPercentage = monthlyRevenue > 0 ? variableCosts / monthlyRevenue : 0;
    const breakEven = fixedCosts / (1 - variableCostsPercentage);

    let currentCash = cashBalance;
    const projection = [];
    const revenueProjection = [];

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

      profitThisStep -= (loanInfo.totalPayment * revenueFactor);

      // Add one-time events only in the first month of projection
      if (i === 0) {
        profitThisStep += (oneTimeRevenue || 0);
        profitThisStep -= (oneTimeCost || 0);
      }

      currentCash += profitThisStep; // Add this month's profit to cash
      projection.push(currentCash);
      revenueProjection.push(revenueThisStep / revenueFactor);
    }

  // It's OK to update derived forecast state here after computing projection
  // eslint-disable-next-line react-hooks/set-state-in-effect
  setForecastData({ projection, revenueProjection, breakEven });
  }, [cashBalance, monthlyRevenue, fixedCosts, variableCosts, revenueGrowth, oneTimeRevenue, oneTimeCost, timeline, loanInfo.totalPayment]);

  const getChartLabels = () => {
    const labels = [];
    const now = new Date();
    
    if (timeline === '7d' || timeline === '1m') {
      const days = timeline === '7d' ? 7 : 30;
      for (let i = 1; i <= days; i++) {
        const d = new Date(now);
        d.setDate(d.getDate() + i);
        labels.push(d.toLocaleDateString(language === 'fi' ? 'fi-FI' : 'en-US', { month: 'short', day: 'numeric' }));
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

  const primaryColor = theme === 'dark' ? '#22c55e' : '#16a34a';
  const primaryRgb = theme === 'dark' ? '34, 197, 94' : '22, 163, 74';
  const secondaryColor = theme === 'dark' ? '#737373' : '#737373';
  const secondaryRgb = theme === 'dark' ? '115, 115, 115' : '115, 115, 115';

  const chartData = {
    labels: chartLabels,
    datasets: [
      {
        id: 'cashBalance',
        label: t.cashBalanceLabel,
        data: forecastData.projection,
        borderColor: '#10B981', // Emerald 500
        backgroundColor: (context) => {
          if (chartType === 'bar') {
            return `rgba(${primaryRgb}, 0.7)`;
          }
          const chart = context.chart;
          const { ctx, chartArea } = chart;

          if (!chartArea) {
            // This case happens on initial chart load, gradient will be applied later
            return null;
          }
          const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
          gradient.addColorStop(0, `rgba(16, 185, 129, 0.0)`); // Start transparent
          gradient.addColorStop(0.5, `rgba(16, 185, 129, 0.05)`); // Fade to a very subtle color halfway up
          gradient.addColorStop(1, `rgba(16, 185, 129, 0.2)`);  // End with a softer opacity at the top
          return gradient;
        },
        borderWidth: 2,
        tension: 0, // Sharp, stepped line
        pointRadius: 0,
        pointHoverRadius: 4,
        fill: true,
        hidden: !showCashFlow,
      },
      {
        id: 'monthlyRevenue',
        label: t.monthlyRevenue,
        data: forecastData.revenueProjection,
        borderColor: '#94a3b8', // Slate 400
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderDash: [6, 6],
        tension: 0,
        pointRadius: 0,
        pointHoverRadius: 4,
        hidden: !showRevenue,
      },
    ],
  };

  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 750,
      easing: 'easeInOutQuart',
    },
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false, // We have a card title already
      },
      tooltip: {
        backgroundColor: theme === 'dark' ? '#262626' : '#ffffff',
        titleColor: theme === 'dark' ? '#f5f5f5' : '#0f172a',
        bodyColor: theme === 'dark' ? '#a3a3a3' : '#475569',
        borderColor: theme === 'dark' ? '#404040' : '#e2e8f0',
        borderWidth: 1,
        padding: 12,
        displayColors: false,
        titleFont: { family: "'Inter', sans-serif", size: 13, weight: '600' },
        bodyFont: { family: "'Inter', sans-serif", size: 12 },
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
        position: 'right',
        beginAtZero: true,
        grid: {
          color: theme === 'dark' ? '#333333' : '#f1f5f9',
          drawBorder: false,
        },
        border: { display: false },
        ticks: {
          font: { family: "'Inter', sans-serif", size: 11 },
          color: theme === 'dark' ? '#a3a3a3' : '#94a3b8',
          padding: 10,
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
          color: theme === 'dark' ? '#a3a3a3' : '#94a3b8',
          padding: 10
        },
      }
    },
    interaction: {
      mode: 'index',
      intersect: false,
    },
  }), [language, theme]);

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
        backgroundColor: 'var(--surface-bg)'
      }}>
        <div className="card-body p-5">
          {showConfirmation ? (
            <div className="text-center">
              <div className="mb-4 text-primary">
                <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4Zm2-1a1 1 0 0 0-1 1v.217l7 4.2 7-4.2V4a1 1 0 0 0-1-1H2Zm13 2.383-4.708 2.825L15 11.105V5.383Zm-.034 6.876-5.64-3.471L8 9.583l-1.326-.795-5.64 3.47A1 1 0 0 0 2 13h12a1 1 0 0 0 .966-.741ZM1 11.105l4.708-2.897L1 5.383v5.722Z"/>
                </svg>
              </div>
              <h3 className="fw-bold mb-3">Check your email</h3>
              <p className="text-muted mb-4">We have sent you a confirmation email. Please confirm your email to continue.</p>
              <button className="btn btn-primary w-100 fw-bold" onClick={() => { setShowConfirmation(false); setAuthMode('login'); }}>Back to Log In</button>
            </div>
          ) : (
            <>
          <div className="text-center mb-4">
            <h3 className="fw-bold mb-1">{authMode === 'login' ? 'Log In' : (authMode === 'signup' ? 'Sign Up' : t.resetPassword)}</h3>
            <p className="text-muted small">{authMode === 'login' ? 'Welcome back to Rahanto' : (authMode === 'signup' ? 'Create your Rahanto account' : t.enterEmailReset)}</p>
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
              <button className="btn btn-outline-secondary w-100 fw-bold py-2 d-flex align-items-center justify-content-center gap-2" style={{backgroundColor: 'var(--surface-bg)', color: 'var(--text-primary)', borderColor: 'var(--border-color)'}} onClick={handleGoogleLogin}>
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
              <button className="btn btn-link text-secondary text-decoration-none small" onClick={() => { setShowLoginModal(false); setShowConfirmation(false); }}>{t.later}</button>
            </div>
          </div>
            </>
          )}
        </div>
      </div>
    </div>
  );

  const upgradeModal = showUpgradeModal && (
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
        maxWidth: '450px',
        borderRadius: '24px',
        backgroundColor: 'var(--surface-bg)'
      }}>
        <div className="card-body p-5 text-center">
          <div className="mb-4 d-inline-flex align-items-center justify-content-center rounded-circle bg-warning-subtle text-warning p-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" viewBox="0 0 16 16">
              <path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2zM5 8h6a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z"/>
            </svg>
          </div>
          <h3 className="fw-bold mb-2">{t.welcome.premium}</h3>
          <p className="text-muted mb-4">{t.upgradeForFeature}</p>
          
          <div className="d-grid gap-2">
            <button className="btn btn-primary btn-lg fw-bold rounded-pill" onClick={handleRedirectToCheckout}>
              {t.welcome.upgradeToPremium}
            </button>
            <button className="btn btn-link text-secondary text-decoration-none" onClick={() => setShowUpgradeModal(false)}>
              {t.cancel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const paymentSuccessModal = showPaymentSuccess && (
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
        maxWidth: '450px',
        borderRadius: '24px',
        backgroundColor: 'var(--surface-bg)'
      }}>
        <div className="card-body p-5 text-center">
          <div className="mb-4 d-inline-flex align-items-center justify-content-center rounded-circle bg-success-subtle text-success p-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" viewBox="0 0 16 16">
              <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
            </svg>
          </div>
          <h3 className="fw-bold mb-2">{t.welcome.premiumActivated}</h3>
          <p className="text-muted mb-4">Thank you for upgrading! You now have unlimited access.</p>
          
          <button className="btn btn-primary btn-lg fw-bold rounded-pill w-100" onClick={() => setShowPaymentSuccess(false)}>
            {t.continue}
          </button>
        </div>
      </div>
    </div>
  );

  if (location.pathname === '/settings' && user) {
    return (
      <>
        <style>{globalStyles}</style>
        <ProfileSettings 
          user={user} 
          onUpdateUser={handleUpdateUser} 
          onClose={() => navigate('/')} 
          onDeleteAccount={setAccountToDelete}
          t={t} 
        />
      </>
    );
  }

  if (showSupport && user) {
    return (
      <>
        <style>{globalStyles}</style>
        <Support 
          user={user} 
          onClose={() => setShowSupport(false)} 
          t={t} 
        />
      </>
    );
  }

  // Account deletion confirmation modal
  if (accountToDelete) {
    return (
      <>
        <style>{globalStyles}</style>
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
        <style>{globalStyles}</style>
        {loginModal}
        <nav className="top-nav">
          <div className="d-flex align-items-center gap-3">
            <a href="#" className="nav-logo" onClick={(e) => { e.preventDefault(); handleGoHome(); }} title="Go to Front Page">Rahanto</a>
          </div>
          <div className="nav-actions">
            <div className="d-flex align-items-center me-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" className={`me-2 ${theme === 'light' ? 'text-warning' : 'text-secondary opacity-50'}`}>
                <path d="M8 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6zm0 1a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM8 0a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 0zm0 13a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 13zm8-5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2a.5.5 0 0 1 .5.5zM3 8a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2A.5.5 0 0 1 3 8zm10.657-5.657a.5.5 0 0 1 0 .707l-1.414 1.415a.5.5 0 1 1-.707-.708l1.414-1.414a.5.5 0 0 1 .707 0zm-9.193 9.193a.5.5 0 0 1 0 .707L3.05 13.657a.5.5 0 0 1-.707-.707l1.414-1.414a.5.5 0 0 1 .707 0zm9.193 2.121a.5.5 0 0 1-.707 0l-1.414-1.414a.5.5 0 0 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .707zM4.464 4.465a.5.5 0 0 1-.707 0L2.343 3.05a.5.5 0 1 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .708z"/>
              </svg>
              <div className="form-check form-switch mb-0 min-h-0">
                <input 
                  className="form-check-input" 
                  type="checkbox" 
                  role="switch" 
                  checked={theme === 'dark'}
                  onChange={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                  style={{cursor: 'pointer'}}
                />
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" className={`ms-2 ${theme === 'dark' ? 'text-white' : 'text-secondary opacity-50'}`}>
                <path d="M6 .278a.768.768 0 0 1 .08.858 7.208 7.208 0 0 0-.878 3.46c0 4.021 3.278 7.277 7.318 7.277.527 0 1.04-.055 1.533-.16a.787.787 0 0 1 .81.316.733.733 0 0 1-.031.893A8.349 8.349 0 0 1 8.344 16C3.734 16 0 12.286 0 7.71 0 4.266 2.114 1.312 5.124.06A.752.752 0 0 1 6 .278z"/>
              </svg>
            </div>
            {user ? (
              <div className="profile-dropdown-container">
                <button className="btn btn-sm btn-white border rounded-pill d-flex align-items-center gap-2" onClick={() => setShowProfileDropdown(prev => !prev)}>
                  <span className="fw-bold">{user.name}</span>
                  {user.isPremium && <span className="badge bg-warning text-dark">Premium</span>}
                </button>
                {showProfileDropdown && (
                  <div className="profile-dropdown card border-0 shadow-lg fade-scale">
                    <div className="p-3 border-bottom">
                      <p className="small text-muted mb-0">Signed in as</p>
                      <p className="fw-bold mb-0">{user.email}</p>
                      </div>
                    <button className="dropdown-item" onClick={() => { navigate('/settings'); setShowProfileDropdown(false); }}>{t.profileSettings}</button>
                    <button className="dropdown-item" onClick={() => { setShowSupport(true); setShowProfileDropdown(false); }}>{t.support}</button>
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
                navigate(`/projects/${encodeURIComponent(p.name)}`);
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
              <div 
                className="project-card new-project d-flex flex-column align-items-center justify-content-center p-4" 
                style={{
                  cursor: 'pointer', 
                  background: 'var(--surface-bg)',
                  border: '2px dashed var(--border-color)',
                  opacity: 1
                }} 
                onClick={() => setShowUpgradeModal(true)}
                title={t.upgradeToCreateMore}
              >
                <div className="mb-3 d-flex align-items-center justify-content-center rounded-circle bg-warning-subtle text-warning" style={{width: '50px', height: '50px'}}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2zM5 8h6a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z"/>
                  </svg>
                </div>
                <h6 className="fw-bold mb-3">{t.welcome.premiumFeature2}</h6>
                <button className="btn btn-sm btn-primary rounded-pill px-4 fw-bold shadow-sm">
                  {t.welcome.upgradeToPremium}
                </button>
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
          <Footer onOpenPage={setActivePage} t={t} />
        </main>

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
      </div>
    );
  }

  if (!activeProject) {
    // Show Welcome front page first; Welcome will call back into createProject when finished
    return (
      <>
        <style>{globalStyles}</style>
        {loginModal}
        {upgradeModal}
        {paymentSuccessModal}
        <Welcome
          onStartExisting={createProject}
          onShowManager={() => setShowProjectManager(true)}
          t={t}
          language={language}
          theme={theme}
          onToggleTheme={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          existingProjects={projects}
          user={user}
          onOpenLogin={() => setShowLoginModal(true)}
          onOpenProfile={() => navigate('/settings')}
          onOpenSupport={() => setShowSupport(true)}
          onUpgradeToPremium={handleRedirectToCheckout}
          onRedeemUpgrade={handleUpgradeToPremium}
          setActivePage={setActivePage}
          onLogout={handleLogout}
          isCreatingNewProject={isCreatingNewProject}
          onChangeLanguage={(lang) => {
            try { localStorage.setItem('language', lang); } catch { void 0; }
            setLanguage(lang);
          }}
          onLimitReached={() => setShowUpgradeModal(true)}
        />
        <Footer onOpenPage={setActivePage} t={t} />
      </>
    );
  }

  if (activePage === 'cookie-policy') return <><style>{globalStyles}</style><CookiePolicy t={t} theme={theme} onBack={() => setActivePage('welcome')} /></>;
  if (activePage === 'privacy-policy') return <><style>{globalStyles}</style><PrivacyPolicy t={t} theme={theme} onBack={() => setActivePage('welcome')} /></>;
  if (activePage === 'patch-notes') return <><style>{globalStyles}</style><PatchNotes t={t} theme={theme} onBack={() => setActivePage('welcome')} /></>;

  if (showOverview) {
    return (
      <>
        <style>{globalStyles}</style>
        {loginModal}
        <Overview project={activeProject} onUpdateProject={updateProject} onContinue={() => setShowOverview(false)} onHome={handleGoHome} t={t} />
      </>
    );
  }

  return (
    <div className="app-container">
      <style>{globalStyles}</style>
      {loginModal}
      {upgradeModal}
      {paymentSuccessModal}
      {/* Navigation */}
      <nav className="top-nav">
        <div className="d-flex align-items-center gap-3">
          <a href="#" className="nav-logo" onClick={(e) => { e.preventDefault(); handleGoHome(); }} title="Go to Front Page">Rahanto</a>
          
          <div className="d-flex align-items-center gap-2">
            <span className="fw-bold" style={{color: 'var(--text-primary)'}}>{activeProject.name}</span>
            <button className="btn btn-sm btn-white border text-secondary" onClick={() => navigate('/projects')}>{t.changeProject}</button>
          </div>
        </div>
        <div className="nav-actions">
          <button className="btn btn-sm btn-outline-secondary me-2" onClick={handleExport}>
            {t.export}
            {!user?.isPremium && (
              <span className="ms-2 text-warning" title="Premium Feature">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16" style={{verticalAlign: 'text-bottom'}}>
                  <path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2zM5 8h6a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z"/>
                </svg>
              </span>
            )}
          </button>
          <div className="d-flex align-items-center me-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" className={`me-2 ${theme === 'light' ? 'text-warning' : 'text-secondary opacity-50'}`}>
              <path d="M8 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6zm0 1a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM8 0a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 0zm0 13a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 13zm8-5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2a.5.5 0 0 1 .5.5zM3 8a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2A.5.5 0 0 1 3 8zm10.657-5.657a.5.5 0 0 1 0 .707l-1.414 1.415a.5.5 0 1 1-.707-.708l1.414-1.414a.5.5 0 0 1 .707 0zm-9.193 9.193a.5.5 0 0 1 0 .707L3.05 13.657a.5.5 0 0 1-.707-.707l1.414-1.414a.5.5 0 0 1 .707 0zm9.193 2.121a.5.5 0 0 1-.707 0l-1.414-1.414a.5.5 0 0 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .707zM4.464 4.465a.5.5 0 0 1-.707 0L2.343 3.05a.5.5 0 1 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .708z"/>
            </svg>
            <div className="form-check form-switch mb-0 min-h-0">
              <input 
                className="form-check-input" 
                type="checkbox" 
                role="switch" 
                checked={theme === 'dark'}
                onChange={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                style={{cursor: 'pointer'}}
              />
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" className={`ms-2 ${theme === 'dark' ? 'text-white' : 'text-secondary opacity-50'}`}>
              <path d="M6 .278a.768.768 0 0 1 .08.858 7.208 7.208 0 0 0-.878 3.46c0 4.021 3.278 7.277 7.318 7.277.527 0 1.04-.055 1.533-.16a.787.787 0 0 1 .81.316.733.733 0 0 1-.031.893A8.349 8.349 0 0 1 8.344 16C3.734 16 0 12.286 0 7.71 0 4.266 2.114 1.312 5.124.06A.752.752 0 0 1 6 .278z"/>
            </svg>
          </div>
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
                </button>
                <button className={`dropdown-item d-flex align-items-center justify-content-between ${language === 'fi' ? 'active' : ''}`} onClick={() => { setLanguage('fi'); setShowLanguageDropdown(false); }}>
                  <span>Suomi</span>
                </button>
              </div>
            )}
          </div>
          {user ? (
              <div className="profile-dropdown-container">
                <button className="btn btn-sm btn-white border rounded-pill px-3 d-flex align-items-center gap-2" onClick={() => setShowProfileDropdown(prev => !prev)}>
                  <span className="fw-bold">{user.name}</span>
                  {user.isPremium && <span className="badge bg-warning text-dark">Premium</span>}
                </button>
                {showProfileDropdown && (
                  <div className="profile-dropdown card border-0 shadow-lg fade-scale">
                    <div className="p-3 border-bottom">
                      <p className="small text-muted mb-0">Signed in as</p>
                      <p className="fw-bold mb-0">{user.email}</p>
                      </div>
                    {!user.isPremium && (
                      <button className="dropdown-item text-primary fw-bold" onClick={() => { setShowUpgradeModal(true); setShowProfileDropdown(false); }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="me-2" viewBox="0 0 16 16">
                          <path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2zM5 8h6a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z"/>
                        </svg>
                        {t.welcome.upgradeToPremium}
                      </button>
                    )}
                    <button className="dropdown-item" onClick={() => { navigate('/settings'); setShowProfileDropdown(false); }}>{t.profileSettings}</button>
                    <button className="dropdown-item" onClick={() => { setShowSupport(true); setShowProfileDropdown(false); }}>{t.support}</button>
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
            <a href="#" className={`nav-item-custom ${activeView === 'dashboard' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); navigate('/'); }}>
              {t.predictionTab}
            </a>
            <a href="#" className={`nav-item-custom ${activeView === 'history' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); navigate('/history'); }}>
              {t.history.title}
            </a>
            <hr className="my-2 text-muted opacity-25" />
            {premiumFeaturesList.map(feature => (
              <a key={feature.key} href="#" className={`nav-item-custom d-flex justify-content-between align-items-center ${activeView === feature.key ? 'active' : ''}`} onClick={(e) => {
                  e.preventDefault();
                  handleFeatureClick(feature.key);
              }}>
                  <span>{feature.label}</span>
                  {!user?.isPremium && (
                    <span className="badge bg-warning text-dark ms-2 d-flex align-items-center" style={{fontSize: '0.6rem', padding: '0.25em 0.5em'}}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" fill="currentColor" viewBox="0 0 16 16" className="me-1">
                        <path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/>
                      </svg>
                      PRO
                    </span>
                  )}
              </a>
            ))}
          </aside>
          <div className="main-content">
            <Routes>
              <Route path="/" element={
          <div className="dashboard-grid">
            {/* Left Column: Inputs */}
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body p-3">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <div className="p-1 rounded-pill d-inline-flex" style={{backgroundColor: 'var(--highlight-bg)'}}>
                    <button 
                      className={`btn btn-sm rounded-pill px-3 ${inputMode === 'easy' ? 'shadow-sm fw-bold' : 'text-muted'}`} 
                      onClick={() => setInputMode('easy')}
                      style={inputMode === 'easy' ? {backgroundColor: 'var(--surface-bg)', color: 'var(--text-primary)'} : {border: 'none'}}
                    >
                      {t.easyTab}
                    </button>
                    <button 
                      className={`btn btn-sm rounded-pill px-3 ${inputMode === 'advanced' ? 'shadow-sm fw-bold' : 'text-muted'}`} 
                      onClick={handleAdvancedTabClick}
                      style={inputMode === 'advanced' ? {backgroundColor: 'var(--surface-bg)', color: 'var(--text-primary)'} : {border: 'none'}}
                    >
                      {t.advancedTab} {!user?.isPremium && (
                        <span className="ms-1 text-warning">
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 16 16" style={{verticalAlign: 'text-top'}}>
                            <path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2zM5 8h6a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z"/>
                          </svg>
                        </span>
                      )}
                    </button>
                  </div>
                  <button className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1" onClick={handleResetInputs}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                      <path fillRule="evenodd" d="M8 3a5 5 0 1 1-4.546 2.914.5.5 0 0 0-.908-.417A6 6 0 1 0 8 2v1z"/>
                      <path d="M8 4.466V.534a.25.25 0 0 0-.41-.192L5.23 2.308a.25.25 0 0 0 0 .384l2.36 1.966A.25.25 0 0 0 8 4.466z"/>
                    </svg>
                    {t.reset}
                  </button>
                </div>

                {inputMode === 'easy' && (
                  <div className="p-1 fade-scale">
                    <div className="d-flex flex-column gap-3">
                      <div>
                        <label htmlFor="easy-cash" className="form-label small text-muted fw-bold">
                          {t.cashBalance}
                          <InfoTooltip text={t.tooltips?.cashBalance} />
                        </label>
                        <div className="input-group">
                          <span className="input-group-text border-end-0 text-muted">€</span>
                          <input type="text" className="form-control border-start-0 ps-1" id="easy-cash" placeholder="0" value={formatForInput(cashBalance)} onChange={(e) => setCashBalance(parseFromInput(e.target.value))} />
                        </div>
                      </div>
                      <div>
                        <label htmlFor="monthlyRevenue" className="form-label small text-muted fw-bold">
                          {t.monthlyIncome}
                          <InfoTooltip text={t.tooltips?.monthlyRevenue} />
                        </label>
                        <div className="input-group">
                          <span className="input-group-text border-end-0 text-muted">€</span>
                          <input type="text" className={`form-control border-start-0 ps-1 ${highlightMonthlyRevenue ? 'input-highlight-flash' : ''}`} id="monthlyRevenue" placeholder="0" value={formatForInput(monthlyRevenue)} onChange={(e) => {
                            const val = parseFromInput(e.target.value);
                            setMonthlyRevenue(val);
                            if (units > 0) setUnitPrice(val / units);
                          }} />
                        </div>
                      </div>
                      <div>
                        <label htmlFor="easy-fixed" className="form-label small text-muted fw-bold">
                          {t.monthlyCosts}
                          <InfoTooltip text={t.tooltips?.fixedCosts} />
                        </label>
                        <div className="input-group">
                          <span className="input-group-text border-end-0 text-muted">€</span>
                          <input type="text" className="form-control border-start-0 ps-1" id="easy-fixed" placeholder="0" value={formatForInput(fixedCosts)} onChange={(e) => setFixedCosts(parseFromInput(e.target.value))} />
                        </div>
                      </div>
                      <div>
                        <label htmlFor="loanPaymentDisplay" className="form-label small text-muted fw-bold">
                          {t.loanPayment}
                        </label>
                        <div className="input-group">
                          <span className="input-group-text border-end-0 text-muted">€</span>
                          <input type="text" className="form-control border-start-0 ps-1" style={{backgroundColor: 'var(--highlight-bg)'}} id="loanPaymentDisplay" value={formatForInput(loanInfo.totalPayment)} readOnly />
                          <button className="btn btn-outline-secondary" type="button" onClick={() => navigate('/assets')}>{t.edit}</button>
                        </div>
                        {loanInfo.weightedRate > 0 && (
                          <div className="form-text small text-muted mt-1">
                            {t.loans.weightedAverageRate(loanInfo.weightedRate.toFixed(2))}
                          </div>
                        )}
                      </div>
                      <div className="border-top pt-3 mt-1">
                        <button 
                          className="btn btn-link p-0 text-decoration-none fw-bold d-flex align-items-center w-100 justify-content-between"
                          style={{color: 'var(--text-primary)'}}
                          onClick={() => setShowUnitEconomics(!showUnitEconomics)}
                        >
                          <span className="small text-uppercase text-muted" style={{fontSize: '0.75rem', letterSpacing: '1px'}}>{t.unitEconomics}</span>
                          <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            width="16" 
                            height="16" 
                            fill="currentColor" 
                            viewBox="0 0 16 16"
                            className="text-muted"
                            style={{transform: showUnitEconomics ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s'}}
                          >
                            <path fillRule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"/>
                          </svg>
                        </button>
                        
                        {showUnitEconomics && (
                          <div className="mt-3 d-flex flex-column gap-3 fade-scale">
                            <div>
                              <label htmlFor="unitsSold" className="form-label small text-muted fw-bold">
                                {t.unitsSold}
                              </label>
                              <div className="input-group">
                                <input type="text" className="form-control border-end-0" id="unitsSold" placeholder="0" value={formatForInput(units)} onChange={(e) => {
                                  const val = parseFromInput(e.target.value);
                                  setUnits(val);
                                  setMonthlyRevenue(val * unitPrice);
                                  setVariableCosts(val * unitCost);
                                }} />
                                <span className="input-group-text border-start-0 text-muted">{t.unitsLabel}</span>
                              </div>
                            </div>
                            <div className="row g-2">
                              <div className="col-6">
                                <label htmlFor="pricePerUnit" className="form-label small text-muted fw-bold">
                                  {t.pricePerUnit}
                                </label>
                                <div className="input-group">
                                  <span className="input-group-text border-end-0 text-muted">€</span>
                                  <input type="text" className={`form-control border-start-0 ps-1 ${highlightUnitPrice ? 'input-highlight-flash' : ''}`} id="pricePerUnit" placeholder="0" value={formatForInput(unitPrice)} onChange={(e) => {
                                    const val = parseFromInput(e.target.value);
                                    setUnitPrice(val);
                                    setMonthlyRevenue(units * val);
                                  }} />
                                </div>
                              </div>
                              <div className="col-6">
                                <label htmlFor="costPerUnit" className="form-label small text-muted fw-bold">
                                  {t.costPerUnit}
                                </label>
                                <div className="input-group">
                                  <span className="input-group-text border-end-0 text-muted">€</span>
                                  <input type="text" className="form-control border-start-0 ps-1" id="costPerUnit" placeholder="0" value={formatForInput(unitCost)} onChange={(e) => {
                                    const val = parseFromInput(e.target.value);
                                    setUnitCost(val);
                                    setVariableCosts(units * val);
                                  }} />
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {inputMode === 'advanced' && (
                  <div className="p-1 fade-scale">
                    <div className="d-flex flex-column gap-4">
                      {/* Core */}
                      <div>
                        <label htmlFor="cashBalance" className="form-label small text-muted fw-bold">
                          {t.cashBalance}
                          <InfoTooltip text={t.tooltips?.cashBalance} />
                        </label>
                        <div className="input-group">
                          <span className="input-group-text border-end-0 text-muted">€</span>
                          <input type="text" className="form-control border-start-0 ps-1" id="cashBalance" placeholder="0" value={formatForInput(cashBalance)} onChange={(e) => setCashBalance(parseFromInput(e.target.value))} />
                        </div>
                      </div>
                      {/* Income */}
                      <div>
                        <h6 className="text-uppercase text-secondary fw-bold" style={{fontSize: '0.75rem', letterSpacing: '1px'}}>{t.income}</h6>
                        <div className="p-3 rounded" style={{backgroundColor: 'var(--highlight-bg)'}}>
                          <label htmlFor="monthlyRevenueAdv" className="form-label small text-muted fw-bold">
                            {t.monthlyRevenue}
                            <InfoTooltip text={t.tooltips?.monthlyRevenue} />
                          </label>
                          <div className="input-group">
                            <span className="input-group-text border-end-0 text-muted">€</span>
                            <input type="text" className={`form-control border-start-0 ps-1 ${highlightMonthlyRevenue ? 'input-highlight-flash' : ''}`} id="monthlyRevenueAdv" placeholder="0" value={formatForInput(monthlyRevenue)} onChange={(e) => {
                              const val = parseFromInput(e.target.value);
                              setMonthlyRevenue(val);
                              if (units > 0) setUnitPrice(val / units);
                            }} />
                          </div>
                        </div>
                      </div>
                      {/* Costs */}
                      <div>
                        <h6 className="text-uppercase text-secondary fw-bold" style={{fontSize: '0.75rem', letterSpacing: '1px'}}>{t.recurringCosts}</h6>
                        <div className="p-3 rounded d-flex flex-column gap-3" style={{backgroundColor: 'var(--highlight-bg)'}}>
                          <div>
                            <label htmlFor="fixedCosts" className="form-label small text-muted fw-bold">
                              {t.fixedCosts}
                              <InfoTooltip text={t.tooltips?.fixedCosts} />
                            </label>
                            <div className="input-group"><span className="input-group-text border-end-0 text-muted">€</span><input type="text" className="form-control border-start-0 ps-1" id="fixedCosts" placeholder="0" value={formatForInput(fixedCosts)} onChange={(e) => setFixedCosts(parseFromInput(e.target.value))} /></div>
                          </div>
                          <div>
                            <label htmlFor="variableCosts" className="form-label small text-muted fw-bold">
                              {t.variableCosts}
                              <InfoTooltip text={t.tooltips?.variableCosts} />
                            </label>
                            <div className="input-group"><span className="input-group-text border-end-0 text-muted">€</span><input type="text" className="form-control border-start-0 ps-1" id="variableCosts" placeholder="0" value={formatForInput(variableCosts)} onChange={(e) => {
                              const val = parseFromInput(e.target.value);
                              setVariableCosts(val);
                              if (units > 0) setUnitCost(val / units);
                            }} /></div>
                          </div>
                          <div>
                            <label htmlFor="loanPaymentDisplayAdv" className="form-label small text-muted fw-bold">
                              {t.loanPayment}
                            </label>
                            <div className="input-group">
                              <span className="input-group-text border-end-0 text-muted">€</span>
                              <input type="text" className="form-control border-start-0 ps-1" style={{backgroundColor: 'var(--highlight-bg)'}} id="loanPaymentDisplayAdv" value={formatForInput(loanInfo.totalPayment)} readOnly />
                              <button className="btn btn-outline-secondary" type="button" onClick={() => navigate('/assets')}>{t.edit}</button>
                            </div>
                            {loanInfo.weightedRate > 0 && (
                              <div className="form-text small text-muted mt-1">
                                {t.loans.weightedAverageRate(loanInfo.weightedRate.toFixed(2))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      {/* One-Time Events */}
                      <div>
                        <h6 className="text-uppercase text-secondary fw-bold" style={{fontSize: '0.75rem', letterSpacing: '1px'}}>{t.oneTimeEvents}</h6>
                        <div className="p-3 rounded d-flex flex-column gap-3" style={{backgroundColor: 'var(--highlight-bg)'}}>
                          <div>
                            <label htmlFor="oneTimeRevenue" className="form-label small text-muted fw-bold">
                              {t.oneTimeRevenue}
                              <InfoTooltip text={t.tooltips?.oneTimeRevenue} />
                            </label>
                            <div className="input-group"><span className="input-group-text border-end-0 text-muted">€</span><input type="text" className="form-control border-start-0 ps-1" id="oneTimeRevenue" placeholder="0" value={formatForInput(oneTimeRevenue)} onChange={(e) => setOneTimeRevenue(parseFromInput(e.target.value))} /></div>
                          </div>
                          <div>
                            <label htmlFor="oneTimeCost" className="form-label small text-muted fw-bold">
                              {t.oneTimeCost}
                              <InfoTooltip text={t.tooltips?.oneTimeCost} />
                            </label>
                            <div className="input-group"><span className="input-group-text border-end-0 text-muted">€</span><input type="text" className="form-control border-start-0 ps-1" id="oneTimeCost" placeholder="0" value={formatForInput(oneTimeCost)} onChange={(e) => setOneTimeCost(parseFromInput(e.target.value))} /></div>
                          </div>
                        </div>
                      </div>
                      {/* Assumptions */}
                      <div>
                        <h6 className="text-uppercase text-secondary fw-bold" style={{fontSize: '0.75rem', letterSpacing: '1px'}}>{t.assumptions}</h6>
                        <div className="p-3 rounded" style={{backgroundColor: 'var(--highlight-bg)'}}>
                          <label htmlFor="revenueGrowth" className="form-label small text-muted fw-bold">
                            {t.revenueGrowth}
                            <InfoTooltip text={t.tooltips?.revenueGrowth} />
                          </label>
                          <div className="input-group"><input type="number" className="form-control border-end-0" id="revenueGrowth" placeholder="0" value={revenueGrowth === 0 ? '' : revenueGrowth} onChange={(e) => setRevenueGrowth(parseFloat(e.target.value) || 0)} /><span className="input-group-text border-start-0 text-muted">%</span></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Results */}
            <div className="d-flex flex-column gap-4">
              <div className="card border-0 shadow-sm" style={{ borderRadius: '16px', overflow: 'hidden' }}>
                <div className="card-body p-4">
                  <div className="d-flex justify-content-between align-items-start mb-4">
                    {activeTab === 'prediction' ? (
                      <div>
                        <div className="text-secondary small fw-bold text-uppercase mb-1" style={{ letterSpacing: '0.05em' }}>
                          {t.monthlyRevenue}
                        </div>
                        <div className="d-flex align-items-center gap-2">
                          <h2 className="fw-bold mb-0" style={{ letterSpacing: '-0.02em', fontSize: '2rem', color: 'var(--text-primary)' }}>
                            {new Intl.NumberFormat(language === 'fi' ? 'fi-FI' : 'en-US', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(monthlyRevenue)}
                          </h2>
                          <span className="badge rounded-pill d-flex align-items-center" style={{ backgroundColor: '#DCFCE7', color: '#15803D', fontWeight: '600', padding: '0.35em 0.65em' }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" className="me-1" viewBox="0 0 16 16">
                              <path fillRule="evenodd" d="M8 12a.5.5 0 0 0 .5-.5V5.707l2.146 2.147a.5.5 0 0 0 .708-.708l-3-3a.5.5 0 0 0-.708 0l-3 3a.5.5 0 1 0 .708.708L7.5 5.707V11.5a.5.5 0 0 0 .5.5z"/>
                            </svg>
                            {revenueGrowth}%
                          </span>
                        </div>
                        <div className="text-muted small mt-1">
                          vs. previous period
                        </div>
                      </div>
                    ) : (
                      <h5 className="mb-0 fw-bold">{t.breakEvenTab}</h5>
                    )}
                    <div className="p-1 rounded-pill d-inline-flex" style={{backgroundColor: 'var(--highlight-bg)'}}>
                      <button 
                        className={`btn btn-sm rounded-pill px-3 ${activeTab === 'prediction' ? 'shadow-sm fw-bold' : 'text-muted'}`} 
                        onClick={() => setActiveTab('prediction')}
                        style={activeTab === 'prediction' ? {backgroundColor: 'var(--surface-bg)', color: 'var(--text-primary)'} : {border: 'none'}}
                      >
                        {t.predictionTab}
                      </button>
                      <button 
                        className={`btn btn-sm rounded-pill px-3 ${activeTab === 'break-even' ? 'shadow-sm fw-bold' : 'text-muted'}`} 
                        onClick={() => setActiveTab('break-even')}
                        style={activeTab === 'break-even' ? {backgroundColor: 'var(--surface-bg)', color: 'var(--text-primary)'} : {border: 'none'}}
                      >
                        {t.breakEvenTab}
                      </button>
                    </div>
                  </div>

                  {activeTab === 'prediction' && (
                    <>
                      <div style={{ height: '350px' }}>
                        {chartType === 'line' ? (
                          <Line options={chartOptions} data={chartData} datasetIdKey="id" />
                        ) : (
                          <Bar options={chartOptions} data={chartData} datasetIdKey="id" />
                        )}
                      </div>
                      <div className="d-flex justify-content-center gap-2 mt-3">
                        <button 
                          className={`btn btn-sm rounded-pill d-flex align-items-center gap-2 border ${showCashFlow ? 'bg-primary-subtle text-primary-emphasis border-primary-subtle fw-bold' : 'text-muted'}`}
                          onClick={() => setShowCashFlow(!showCashFlow)}
                        >
                          <span className="rounded-circle" style={{width: 10, height: 10, backgroundColor: primaryColor, opacity: showCashFlow ? 1 : 0.5}}></span>
                          {t.cashBalanceLabel}
                        </button>
                        <button 
                          className={`btn btn-sm rounded-pill d-flex align-items-center gap-2 border ${showRevenue ? 'bg-secondary-subtle text-secondary-emphasis border-secondary-subtle fw-bold' : 'text-muted'}`}
                          onClick={() => setShowRevenue(!showRevenue)}
                        >
                          <span className="rounded-circle" style={{width: 10, height: 10, backgroundColor: secondaryColor, opacity: showRevenue ? 1 : 0.5}}></span>
                          {t.monthlyRevenue}
                        </button>
                        <div className="vr mx-1"></div>
                        <button 
                          className="btn btn-sm rounded-pill border text-muted d-flex align-items-center gap-2"
                          onClick={() => setChartType(chartType === 'line' ? 'bar' : 'line')}
                          title={chartType === 'line' ? "Switch to Bar Chart" : "Switch to Line Chart"}
                        >
                          {chartType === 'line' ? (
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                              <path d="M1 11a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1v-3zm5-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V7zm5-5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1V2z"/>
                            </svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                              <path fillRule="evenodd" d="M0 0h1v15h15v1H0V0zm10 3.5a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 .5.5v4a.5.5 0 0 1-1 0V4.9l-3.613 4.417a.5.5 0 0 1-.74.037L7.06 6.767l-3.656 5.027a.5.5 0 0 1-.808-.588l4-5.5a.5.5 0 0 1 .758-.06l2.609 2.61L13.445 4H10.5a.5.5 0 0 1-.5-.5z"/>
                            </svg>
                          )}
                        </button>
                      </div>
                      <FinancialDiagnosis 
                        monthlyRevenue={monthlyRevenue} 
                        fixedCosts={fixedCosts} 
                        variableCosts={variableCosts} 
                        cashBalance={cashBalance} 
                        units={units} 
                        revenueGrowth={revenueGrowth}
                        onApplySuggestion={handleApplyPriceSuggestion}
                        language={language} 
                      />
                    </>
                  )}

                  {activeTab === 'prediction' && (
                    <div className="d-flex justify-content-center gap-2 mt-3">
                      {['7d', '1m', '3m', '6m', '1y'].map(opt => (
                        <button key={opt} className={`btn btn-sm ${timeline === opt ? 'btn-secondary' : 'btn-outline-secondary border'}`} onClick={() => setTimeline(opt)}>
                          {opt}
                        </button>
                      ))}
                    </div>
                  )}

                  {activeTab === 'break-even' && (
                    <div className="fade-scale">
                      <div className="p-4 rounded mb-3" style={{backgroundColor: 'var(--highlight-bg)'}}>
                        <p className="text-secondary mb-1 fw-bold small text-uppercase">{t.breakEvenRevenue}</p>
                        <p className="display-4 fw-bold mb-0">€{!isFinite(forecastData.breakEven) ? '...' : `${new Intl.NumberFormat('fi-FI').format(forecastData.breakEven)}`}</p>
                      </div>
                      
                      <div className="row g-3 mb-3">
                          <div className="col-12 col-md-6">
                           <div className="p-3 border rounded h-100" style={{backgroundColor: 'var(--surface-bg)'}}>
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
                        <div className="p-4 rounded" style={{backgroundColor: 'var(--highlight-bg)'}}>
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
                                <div className="progress" style={{height: '10px', backgroundColor: 'var(--border-color)'}}>
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
              } />
              <Route path="/customers" element={user?.isPremium ? <Customers t={t} project={activeProject} onUpdateProject={updateProject} /> : <Navigate to="/" />} />
              <Route path="/history" element={<History t={t} project={activeProject} onUpdateProject={updateProject} theme={theme} language={language} />} />
              <Route path="/assets" element={user?.isPremium ? <Loans t={t} project={activeProject} onUpdateProject={updateProject} theme={theme} language={language} /> : <Navigate to="/" />} />
              <Route path="/projects/*" element={null} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
