    const countryData = [
      { name: "Afghanistan", code: "AF" }, { name: "Albania", code: "AL" }, { name: "Algeria", code: "DZ" },
      { name: "Andorra", code: "AD" }, { name: "Angola", code: "AO" }, { name: "Antigua and Barbuda", code: "AG" },
      { name: "Argentina", code: "AR" }, { name: "Armenia", code: "AM" }, { name: "Australia", code: "AU" },
      { name: "Austria", code: "AT" }, { name: "Azerbaijan", code: "AZ" }, { name: "Bahamas", code: "BS" },
      { name: "Bahrain", code: "BH" }, { name: "Bangladesh", code: "BD" }, { name: "Barbados", code: "BB" },
      { name: "Belarus", code: "BY" }, { name: "Belgium", code: "BE" }, { name: "Belize", code: "BZ" },
      { name: "Benin", code: "BJ" }, { name: "Bhutan", code: "BT" }, { name: "Bolivia", code: "BO" },
      { name: "Bosnia and Herzegovina", code: "BA" }, { name: "Botswana", code: "BW" }, { name: "Brazil", code: "BR" },
      { name: "Brunei", code: "BN" }, { name: "Bulgaria", code: "BG" }, { name: "Burkina Faso", code: "BF" },
      { name: "Burundi", code: "BI" }, { name: "Cabo Verde", code: "CV" }, { name: "Cambodia", code: "KH" },
      { name: "Cameroon", code: "CM" }, { name: "Canada", code: "CA" }, { name: "Central African Republic", code: "CF" },
      { name: "Chad", code: "TD" }, { name: "Chile", code: "CL" }, { name: "China", code: "CN" },
      { name: "Colombia", code: "CO" }, { name: "Comoros", code: "KM" }, { name: "Congo", code: "CG" },
      { name: "Costa Rica", code: "CR" }, { name: "Croatia", code: "HR" }, { name: "Cuba", code: "CU" },
      { name: "Cyprus", code: "CY" }, { name: "Czech Republic", code: "CZ" }, { name: "Denmark", code: "DK" },
      { name: "Djibouti", code: "DJ" }, { name: "Dominica", code: "DM" }, { name: "Dominican Republic", code: "DO" },
      { name: "Ecuador", code: "EC" }, { name: "Egypt", code: "EG" }, { name: "El Salvador", code: "SV" },
      { name: "Equatorial Guinea", code: "GQ" }, { name: "Eritrea", code: "ER" }, { name: "Estonia", code: "EE" },
      { name: "Eswatini", code: "SZ" }, { name: "Ethiopia", code: "ET" }, { name: "Fiji", code: "FJ" },
      { name: "Finland", code: "FI" }, { name: "France", code: "FR" }, { name: "Gabon", code: "GA" },
      { name: "Gambia", code: "GM" }, { name: "Georgia", code: "GE" }, { name: "Germany", code: "DE" },
      { name: "Ghana", code: "GH" }, { name: "Greece", code: "GR" }, { name: "Grenada", code: "GD" },
      { name: "Guatemala", code: "GT" }, { name: "Guinea", code: "GN" }, { name: "Guyana", code: "GY" },
      { name: "Haiti", code: "HT" }, { name: "Honduras", code: "HN" }, { name: "Hungary", code: "HU" },
      { name: "Iceland", code: "IS" }, { name: "India", code: "IN" }, { name: "Indonesia", code: "ID" },
      { name: "Iran", code: "IR" }, { name: "Iraq", code: "IQ" }, { name: "Ireland", code: "IE" },
      { name: "Israel", code: "IL" }, { name: "Italy", code: "IT" }, { name: "Jamaica", code: "JM" },
      { name: "Japan", code: "JP" }, { name: "Jordan", code: "JO" }, { name: "Kazakhstan", code: "KZ" },
      { name: "Kenya", code: "KE" }, { name: "Kiribati", code: "KI" }, { name: "South Korea", code: "KR" },
      { name: "Kuwait", code: "KW" }, { name: "Kyrgyzstan", code: "KG" }, { name: "Laos", code: "LA" },
      { name: "Latvia", code: "LV" }, { name: "Lebanon", code: "LB" }, { name: "Lesotho", code: "LS" },
      { name: "Liberia", code: "LR" }, { name: "Libya", code: "LY" }, { name: "Liechtenstein", code: "LI" },
      { name: "Lithuania", code: "LT" }, { name: "Luxembourg", code: "LU" }, { name: "Madagascar", code: "MG" },
      { name: "Malawi", code: "MW" }, { name: "Malaysia", code: "MY" }, { name: "Maldives", code: "MV" },
      { name: "Mali", code: "ML" }, { name: "Malta", code: "MT" }, { name: "Mauritania", code: "MR" },
      { name: "Mauritius", code: "MU" }, { name: "Mexico", code: "MX" }, { name: "Micronesia", code: "FM" },
      { name: "Moldova", code: "MD" }, { name: "Monaco", code: "MC" }, { name: "Mongolia", code: "MN" },
      { name: "Montenegro", code: "ME" }, { name: "Morocco", code: "MA" }, { name: "Mozambique", code: "MZ" },
      { name: "Myanmar", code: "MM" }, { name: "Namibia", code: "NA" }, { name: "Nauru", code: "NR" },
      { name: "Nepal", code: "NP" }, { name: "Netherlands", code: "NL" }, { name: "New Zealand", code: "NZ" },
      { name: "Nicaragua", code: "NI" }, { name: "Niger", code: "NE" }, { name: "Nigeria", code: "NG" },
      { name: "North Macedonia", code: "MK" }, { name: "Norway", code: "NO" }, { name: "Oman", code: "OM" },
      { name: "Pakistan", code: "PK" }, { name: "Palau", code: "PW" }, { name: "Panama", code: "PA" },
      { name: "Papua New Guinea", code: "PG" }, { name: "Paraguay", code: "PY" }, { name: "Peru", code: "PE" },
      { name: "Philippines", code: "PH" }, { name: "Poland", code: "PL" }, { name: "Portugal", code: "PT" },
      { name: "Qatar", code: "QA" }, { name: "Romania", code: "RO" }, { name: "Russia", code: "RU" },
      { name: "Rwanda", code: "RW" }, { name: "Saudi Arabia", code: "SA" }, { name: "Senegal", code: "SN" },
      { name: "Serbia", code: "RS" }, { name: "Seychelles", code: "SC" }, { name: "Sierra Leone", code: "SL" },
      { name: "Singapore", code: "SG" }, { name: "Slovakia", code: "SK" }, { name: "Slovenia", code: "SI" },
      { name: "Solomon Islands", code: "SB" }, { name: "Somalia", code: "SO" }, { name: "South Africa", code: "ZA" },
      { name: "Spain", code: "ES" }, { name: "Sri Lanka", code: "LK" }, { name: "Sudan", code: "SD" },
      { name: "Suriname", code: "SR" }, { name: "Sweden", code: "SE" }, { name: "Switzerland", code: "CH" },
      { name: "Syria", code: "SY" }, { name: "Taiwan", code: "TW" }, { name: "Tajikistan", code: "TJ" },
      { name: "Tanzania", code: "TZ" }, { name: "Thailand", code: "TH" }, { name: "Timor-Leste", code: "TL" },
      { name: "Togo", code: "TG" }, { name: "Tonga", code: "TO" }, { name: "Trinidad and Tobago", code: "TT" },
      { name: "Tunisia", code: "TN" }, { name: "Turkey", code: "TR" }, { name: "Turkmenistan", code: "TM" },
      { name: "Tuvalu", code: "TV" }, { name: "Uganda", code: "UG" }, { name: "Ukraine", code: "UA" },
      { name: "United Arab Emirates", code: "AE" }, { name: "United Kingdom", code: "GB" },
      { name: "United States", code: "US" }, { name: "Uruguay", code: "UY" }, { name: "Uzbekistan", code: "UZ" },
      { name: "Vanuatu", code: "VU" }, { name: "Vatican City", code: "VA" }, { name: "Venezuela", code: "VE" },
      { name: "Vietnam", code: "VN" }, { name: "Yemen", code: "YE" }, { name: "Zambia", code: "ZM" },
      { name: "Zimbabwe", code: "ZW" }
    ];

    const currencies = [
        { code: "AED", symbol: "AED", name: "AED - UAE Dirham (AED)" },
        { code: "AFN", symbol: "؋", name: "AFN - Afghan Afghani (؋)" },
        { code: "ALL", symbol: "L", name: "ALL - Albanian Lek (L)" },
        { code: "AMD", symbol: "֏", name: "AMD - Armenian Dram (֏)" },
        { code: "ANG", symbol: "ƒ", name: "ANG - Netherlands Antillean Guilder (ƒ)" },
        { code: "AOA", symbol: "Kz", name: "AOA - Angolan Kwanza (Kz)" },
        { code: "ARS", symbol: "$", name: "ARS - Argentine Peso ($)" },
        { code: "AUD", symbol: "$", name: "AUD - Australian Dollar ($)" },
        { code: "AWG", symbol: "ƒ", name: "AWG - Aruban Florin (ƒ)" },
        { code: "AZN", symbol: "₼", name: "AZN - Azerbaijani Manat (₼)" },
        { code: "BAM", symbol: "KM", name: "BAM - Bosnia-Herzegovina Convertible Mark (KM)" },
        { code: "BBD", symbol: "$", name: "BBD - Barbadian Dollar ($)" },
        { code: "BDT", symbol: "৳", name: "BDT - Bangladeshi Taka (৳)" },
        { code: "BGN", symbol: "лв", name: "BGN - Bulgarian Lev (лв)" },
        { code: "BHD", symbol: ".د.ب", name: "BHD - Bahraini Dinar (.د.ب)" },
        { code: "BIF", symbol: "FBu", name: "BIF - Burundian Franc (FBu)" },
        { code: "BMD", symbol: "$", name: "BMD - Bermudian Dollar ($)" },
        { code: "BND", symbol: "$", name: "BND - Brunei Dollar ($)" },
        { code: "BOB", symbol: "Bs.", name: "BOB - Bolivian Boliviano (Bs.)" },
        { code: "BRL", symbol: "R$", name: "BRL - Brazilian Real (R$)" },
        { code: "BSD", symbol: "$", name: "BSD - Bahamian Dollar ($)" },
        { code: "BTN", symbol: "Nu.", name: "BTN - Bhutanese Ngultrum (Nu.)" },
        { code: "BWP", symbol: "P", name: "BWP - Botswana Pula (P)" },
        { code: "BYN", symbol: "Br", name: "BYN - Belarusian Ruble (Br)" },
        { code: "BZD", symbol: "BZ$", name: "BZD - Belize Dollar (BZ$)" },
        { code: "CAD", symbol: "$", name: "CAD - Canadian Dollar ($)" },
        { code: "CDF", symbol: "FC", name: "CDF - Congolese Franc (FC)" },
        { code: "CHF", symbol: "CHF", name: "CHF - Swiss Franc (CHF)" },
        { code: "CLP", symbol: "$", name: "CLP - Chilean Peso ($)" },
        { code: "CNY", symbol: "¥", name: "CNY - Chinese Yuan (¥)" },
        { code: "COP", symbol: "$", name: "COP - Colombian Peso ($)" },
        { code: "CRC", symbol: "₡", name: "CRC - Costa Rican Colón (₡)" },
        { code: "CUP", symbol: "$", name: "CUP - Cuban Peso ($)" },
        { code: "CVE", symbol: "$", name: "CVE - Cape Verdean Escudo ($)" },
        { code: "CZK", symbol: "Kč", name: "CZK - Czech Koruna (Kč)" },
        { code: "DJF", symbol: "Fdj", name: "DJF - Djiboutian Franc (Fdj)" },
        { code: "DKK", symbol: "kr", name: "DKK - Danish Krone (kr)" },
        { code: "DOP", symbol: "RD$", name: "DOP - Dominican Peso (RD$)" },
        { code: "DZD", symbol: "د.ج", name: "DZD - Algerian Dinar (د.ج)" },
        { code: "EGP", symbol: "E£", name: "EGP - Egyptian Pound (E£)" },
        { code: "ERN", symbol: "Nfk", name: "ERN - Eritrean Nakfa (Nfk)" },
        { code: "ETB", symbol: "Br", name: "ETB - Ethiopian Birr (Br)" },
        { code: "EUR", symbol: "€", name: "EUR - Euro (€)" },
        { code: "FJD", symbol: "$", name: "FJD - Fijian Dollar ($)" },
        { code: "FKP", symbol: "£", name: "FKP - Falkland Islands Pound (£)" },
        { code: "GBP", symbol: "£", name: "GBP - British Pound (£)" },
        { code: "GEL", symbol: "₾", name: "GEL - Georgian Lari (₾)" },
        { code: "GHS", symbol: "GH₵", name: "GHS - Ghanaian Cedi (GH₵)" },
        { code: "GIP", symbol: "£", name: "GIP - Gibraltar Pound (£)" },
        { code: "GMD", symbol: "D", name: "GMD - Gambian Dalasi (D)" },
        { code: "GNF", symbol: "FG", name: "GNF - Guinean Franc (FG)" },
        { code: "GTQ", symbol: "Q", name: "GTQ - Guatemalan Quetzal (Q)" },
        { code: "GYD", symbol: "$", name: "GYD - Guyanaese Dollar ($)" },
        { code: "HKD", symbol: "$", name: "HKD - Hong Kong Dollar ($)" },
        { code: "HNL", symbol: "L", name: "HNL - Honduran Lempira (L)" },
        { code: "HRK", symbol: "kn", name: "HRK - Croatian Kuna (kn)" },
        { code: "HTG", symbol: "G", name: "HTG - Haitian Gourde (G)" },
        { code: "HUF", symbol: "Ft", name: "HUF - Hungarian Forint (Ft)" },
        { code: "IDR", symbol: "Rp", name: "IDR - Indonesian Rupiah (Rp)" },
        { code: "ILS", symbol: "₪", name: "ILS - Israeli New Shekel (₪)" },
        { code: "INR", symbol: "₹", name: "INR - Indian Rupee (₹)" },
        { code: "IQD", symbol: "ع.د", name: "IQD - Iraqi Dinar (ع.د)" },
        { code: "IRR", symbol: "﷼", name: "IRR - Iranian Rial (﷼)" },
        { code: "ISK", symbol: "kr", name: "ISK - Icelandic Króna (kr)" },
        { code: "JMD", symbol: "J$", name: "JMD - Jamaican Dollar (J$)" },
        { code: "JOD", symbol: "JD", name: "JOD - Jordanian Dinar (JD)" },
        { code: "JPY", symbol: "¥", name: "JPY - Japanese Yen (¥)" },
        { code: "KES", symbol: "KSh", name: "KES - Kenyan Shilling (KSh)" },
        { code: "KGS", symbol: "сом", name: "KGS - Kyrgystani Som (сом)" },
        { code: "KHR", symbol: "៛", name: "KHR - Cambodian Riel (៛)" },
        { code: "KMF", symbol: "CF", name: "KMF - Comorian Franc (CF)" },
        { code: "KPW", symbol: "₩", name: "KPW - North Korean Won (₩)" },
        { code: "KRW", symbol: "₩", name: "KRW - South Korean Won (₩)" },
        { code: "KWD", symbol: "KD", name: "KWD - Kuwaiti Dinar (KD)" },
        { code: "KYD", symbol: "$", name: "KYD - Cayman Islands Dollar ($)" },
        { code: "KZT", symbol: "₸", name: "KZT - Kazakhstani Tenge (₸)" },
        { code: "LAK", symbol: "₭", name: "LAK - Laotian Kip (₭)" },
        { code: "LBP", symbol: "L£", name: "LBP - Lebanese Pound (L£)" },
        { code: "LKR", symbol: "Rs", name: "LKR - Sri Lankan Rupee (Rs)" },
        { code: "LRD", symbol: "$", name: "LRD - Liberian Dollar ($)" },
        { code: "LSL", symbol: "L", name: "LSL - Lesotho Loti (L)" },
        { code: "LYD", symbol: "LD", name: "LYD - Libyan Dinar (LD)" },
        { code: "MAD", symbol: "MAD", name: "MAD - Moroccan Dirham (MAD)" },
        { code: "MDL", symbol: "L", name: "MDL - Moldovan Leu (L)" },
        { code: "MGA", symbol: "Ar", name: "MGA - Malagasy Ariary (Ar)" },
        { code: "MKD", symbol: "ден", name: "MKD - Macedonian Denar (ден)" },
        { code: "MMK", symbol: "K", name: "MMK - Myanmar Kyat (K)" },
        { code: "MNT", symbol: "₮", name: "MNT - Mongolian Tugrik (₮)" },
        { code: "MOP", symbol: "MOP$", name: "MOP - Macanese Pataca (MOP$)" },
        { code: "MRU", symbol: "UM", name: "MRU - Mauritanian Ouguiya (UM)" },
        { code: "MUR", symbol: "₨", name: "MUR - Mauritian Rupee (₨)" },
        { code: "MVR", symbol: "Rf", name: "MVR - Maldivian Rufiyaa (Rf)" },
        { code: "MWK", symbol: "MK", name: "MWK - Malawian Kwacha (MK)" },
        { code: "MXN", symbol: "$", name: "MXN - Mexican Peso ($)" },
        { code: "MYR", symbol: "RM", name: "MYR - Malaysian Ringgit (RM)" },
        { code: "MZN", symbol: "MT", name: "MZN - Mozambican Metical (MT)" },
        { code: "NAD", symbol: "N$", name: "NAD - Namibian Dollar (N$)" },
        { code: "NGN", symbol: "₦", name: "NGN - Nigerian Naira (₦)" },
        { code: "NIO", symbol: "C$", name: "NIO - Nicaraguan Córdoba (C$)" },
        { code: "NOK", symbol: "kr", name: "NOK - Norwegian Krone (kr)" },
        { code: "NPR", symbol: "Rs", name: "NPR - Nepalese Rupee (Rs)" },
        { code: "NZD", symbol: "$", name: "NZD - New Zealand Dollar ($)" },
        { code: "OMR", symbol: "OMR", name: "OMR - Omani Rial (OMR)" },
        { code: "PAB", symbol: "B/.", name: "PAB - Panamanian Balboa (B/.)" },
        { code: "PEN", symbol: "S/.", name: "PEN - Peruvian Sol (S/.)" },
        { code: "PGK", symbol: "K", name: "PGK - Papua New Guinean Kina (K)" },
        { code: "PHP", symbol: "₱", name: "PHP - Philippine Peso (₱)" },
        { code: "PKR", symbol: "Rs", name: "PKR - Pakistani Rupee (Rs)" },
        { code: "PLN", symbol: "zł", name: "PLN - Polish Zloty (zł)" },
        { code: "PYG", symbol: "₲", name: "PYG - Paraguayan Guarani (₲)" },
        { code: "QAR", symbol: "QR", name: "QAR - Qatari Rial (QR)" },
        { code: "RON", symbol: "lei", name: "RON - Romanian Leu (lei)" },
        { code: "RSD", symbol: "din.", name: "RSD - Serbian Dinar (din.)" },
        { code: "RUB", symbol: "₽", name: "RUB - Russian Ruble (₽)" },
        { code: "RWF", symbol: "FRw", name: "RWF - Rwandan Franc (FRw)" },
        { code: "SAR", symbol: "SR", name: "SAR - Saudi Riyal (SR)" },
        { code: "SBD", symbol: "$", name: "SBD - Solomon Islands Dollar ($)" },
        { code: "SCR", symbol: "SR", name: "SCR - Seychellois Rupee (SR)" },
        { code: "SDG", symbol: "SDG", name: "SDG - Sudanese Pound (SDG)" },
        { code: "SEK", symbol: "kr", name: "SEK - Swedish Krona (kr)" },
        { code: "SGD", symbol: "$", name: "SGD - Singapore Dollar ($)" },
        { code: "SHP", symbol: "£", name: "SHP - St. Helena Pound (£)" },
        { code: "SLL", symbol: "Le", name: "SLL - Sierra Leonean Leone (Le)" },
        { code: "SOS", symbol: "Sh.So.", name: "SOS - Somali Shilling (Sh.So.)" },
        { code: "SRD", symbol: "$", name: "SRD - Surinamese Dollar ($)" },
        { code: "SSP", symbol: "£", name: "SSP - South Sudanese Pound (£)" },
        { code: "STN", symbol: "Db", name: "STN - São Tomé & Príncipe Dobra (Db)" },
        { code: "SYP", symbol: "LS", name: "SYP - Syrian Pound (LS)" },
        { code: "SZL", symbol: "E", name: "SZL - Swazi Lilangeni (E)" },
        { code: "THB", symbol: "฿", name: "THB - Thai Baht (฿)" },
        { code: "TJS", symbol: "SM", name: "TJS - Tajikistani Somoni (SM)" },
        { code: "TMT", symbol: "T", name: "TMT - Turkmenistani Manat (T)" },
        { code: "TND", symbol: "DT", name: "TND - Tunisian Dinar (DT)" },
        { code: "TOP", symbol: "T$", name: "TOP - Tongan Paʻanga (T$)" },
        { code: "TRY", symbol: "₺", name: "TRY - Turkish Lira (₺)" },
        { code: "TTD", symbol: "TT$", name: "TTD - Trinidad & Tobago Dollar (TT$)" },
        { code: "TWD", symbol: "NT$", name: "TWD - New Taiwan Dollar (NT$)" },
        { code: "TZS", symbol: "TSh", name: "TZS - Tanzanian Shilling (TSh)" },
        { code: "UAH", symbol: "₴", name: "UAH - Ukrainian Hryvnia (₴)" },
        { code: "UGX", symbol: "USh", name: "UGX - Ugandan Shilling (USh)" },
        { code: "USD", symbol: "$", name: "USD - US Dollar ($)" },
        { code: "UYU", symbol: "$U", name: "UYU - Uruguayan Peso ($U)" },
        { code: "UZS", symbol: "so'm", name: "UZS - Uzbekistani Som (so'm)" },
        { code: "VES", symbol: "Bs.S", name: "VES - Venezuelan Bolívar Sovereign (Bs.S)" },
        { code: "VND", symbol: "₫", name: "VND - Vietnamese Dong (₫)" },
        { code: "VUV", symbol: "VT", name: "VUV - Vanuatu Vatu (VT)" },
        { code: "WST", symbol: "WS$", name: "WST - Samoan Tala (WS$)" },
        { code: "XAF", symbol: "FCFA", name: "XAF - Central African CFA Franc (FCFA)" },
        { code: "XCD", symbol: "EC$", name: "XCD - East Caribbean Dollar (EC$)" },
        { code: "XOF", symbol: "CFA", name: "XOF - West African CFA Franc (CFA)" },
        { code: "XPF", symbol: "CFP", name: "XPF - CFP Franc (CFP)" },
        { code: "YER", symbol: "﷼", name: "YER - Yemeni Rial (﷼)" },
        { code: "ZAR", symbol: "R", name: "ZAR - South African Rand (R)" },
        { code: "ZMW", symbol: "ZK", name: "ZMW - Zambian Kwacha (ZK)" },
        { code: "ZWL", symbol: "Z$", name: "ZWL - Zimbabwean Dollar (Z$)" }
    ];

    window.addEventListener('DOMContentLoaded', () => {
      const countryList = document.getElementById('countryList');
      countryData.forEach(c => {
        const option = document.createElement('option');
        option.value = c.name;
        countryList.appendChild(option);
      });

      const currencySelect = document.getElementById('currency');
      currencies.forEach(c => {
        const option = document.createElement('option');
        option.value = `${c.code} (${c.symbol})`;
        option.textContent = c.name;
        currencySelect.appendChild(option);
      });
    });

    function showToast(message, type = 'success') {
      const container = document.getElementById('toastContainer');
      const toast = document.createElement('div');
      toast.className = `toast-msg ${type}`;
      toast.innerHTML = `<span>${message}</span>`;
      
      container.appendChild(toast);

      setTimeout(() => {
        toast.classList.add('fade-out');
        setTimeout(() => toast.remove(), 200);
      }, 3000);
    }

    function handleCountryChange() {
      const input = document.getElementById('countryInput').value.trim();
      const codeField = document.getElementById('countryCode');
      const found = countryData.find(c => c.name.toLowerCase() === input.toLowerCase());
      
      codeField.value = found ? found.code : '';
    }

    function formatDateString(dateStr) {
      if (!dateStr) return '';
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    }

    function formatTimeString(timeStr) {
      if (!timeStr) return '';
      const [hours, minutes] = timeStr.split(':');
      const h = parseInt(hours, 10);
      const ampm = h >= 12 ? 'PM' : 'AM';
      const formattedHour = h % 12 || 12;
      return `${formattedHour}:${minutes} ${ampm}`;
    }

    document.getElementById('promptForm').addEventListener('submit', function(e) {
      e.preventDefault();

      const choice = document.querySelector('input[name="choice"]:checked').value;
      const travelDate = formatDateString(document.getElementById('travelDate').value);
      const issuanceDate = formatDateString(document.getElementById('issuanceDate').value);
      const country = document.getElementById('countryInput').value;
      const countryCode = document.getElementById('countryCode').value;
      const departureCity = document.getElementById('departureCity').value.toUpperCase();
      const departureTime = formatTimeString(document.getElementById('departureTime').value);
      const pricingStructure = document.getElementById('pricingStructure').value;
      const currency = document.getElementById('currency').value;
      const baseFare = document.getElementById('baseFare').value;
      const fareRules = document.getElementById('fareRules').value;

      if (!countryCode) {
        showToast('Please select a valid country from the dropdown list.', 'warning');
        return;
      }

      let promptText = `You are an elite GDS (Global Distribution System) fare rules expert.

### CONTEXT & RESERVATION DETAILS
• Travel Date: ${travelDate}
• Date of Issuance: ${issuanceDate}
• Issuance Office: ${country} (${countryCode})
• Departure City: ${departureCity}
• Departure Time: ${departureTime}
• Pricing Structure: ${pricingStructure}
• Ticket Base Fare: ${currency} ${baseFare}

### GDS FARE RULES SOURCE DATA
\`\`\`gds_fare_rules
${fareRules}
\`\`\`

### CORE INSTRUCTIONS & ANALYTICAL MANDATES
1. Timezone & No-Show Policy:
   - Consider the cancellation/change request time as the current Philippines local time.
   - Convert this time to the departure city's local time (${departureCity}).
   - Determine the passenger's NO-SHOW status based on the departure city's local departure time and applicable no-show policy.
2. Strict Data Boundary: Analyze and answer using ONLY the provided GDS fare rules source above.
3. Rule Precedence: Always apply the MOST RESTRICTIVE rule condition found.
4. Omission Rule: If a condition is not stated in the fare rules, explicitly state: “Not specified in fare rules”.

### SPECIFIC QUESTION ANALYSIS\n`;

      if (choice === 'Cancellation') {
        promptText += `1. Is the ticket Refundable or Non‑Refundable?
– Answer briefly based on fare rule wording.
2. What is the cancellation penalty BEFORE departure?
– Include timelines or conditions if mentioned.
3. What is the most restrictive cancellation penalty AFTER departure?
– Mention the exact amount, percentage, or non‑refundable condition.
4. What is the most restrictive cancellation penalty for NO‑SHOW / FAILED TO BOARD?
– Specify if an additional no‑show fee applies.
5. What is the most restrictive cancellation penalty PER component / segment / pricing unit?
– Clearly state how the penalty is applied.
6. Do we need to charge cancellation or refund penalties PER PRICING UNIT or PER COMPONENT?
– Answer Yes or No with a short explanation.
7. Do we need to charge cancellation or refund penalties PER Direction / Per Coupon?
8. In case of no‑show / failed to board:
– Do we charge BOTH normal cancellation penalty AND no‑show penalty?
– Answer clearly based on fare rules.
9. Is YQ/YR refundable?
– State refundable / non‑refundable / conditional refund, as per fare rules.
10. Are there any Administrative or Refund Processing Fees that will be deducted when processing the refund, in addition to cancellation or no‑show penalties?
– If yes, specify exact amount, per transaction status, and when it applies.
11. Is the ( cancellation penalty + any admin fee ) lower than the base fare?
12. Is there any GST Tax applied to Cancellation fees or No‑show penalties?
– Specify tax name, exact percentage, or state “Not specified in fare rules”.
13. Currency Note: If there are multiple currencies in the reservation, use the ticket origin currency to charge the customer.`;
      } else {
        promptText += `1. Is the ticket Changeable or Non‑Changeable?
– Answer briefly based on fare rule wording.
2. What is the Change penalty BEFORE departure?
– Include timelines or conditions if mentioned.
3. What is the most restrictive Change penalty AFTER departure?
– Mention the exact amount, percentage, or non‑changeable condition.
4. What is the most restrictive Change penalty for NO‑SHOW / FAILED TO BOARD?
– Specify if an additional no‑show fee applies.
5. What is the most restrictive Change penalty PER component / segment / pricing unit?
– Clearly state how the penalty is applied.
6. Do we need to charge Change penalties PER PRICING UNIT or PER COMPONENT?
– Answer Yes or No with a short explanation.
7. Do we need to charge Change penalties PER Direction / Per Coupon?
8. In case of no‑show / failed to board:
– Do we charge BOTH normal Change penalty AND no‑show penalty?
– Answer clearly based on fare rules.
9. Are there any Administrative or Change Processing Fees that will be charged in addition to change penalties or no‑show penalties?
– If yes, specify exact details and conditions.
10. Currency Note: If there are multiple currencies in the reservation, use the ticket origin currency to charge the customer.`;
      }

      promptText += `\n\n### OUTPUT REQUIREMENTS
• Keep answers concise and professional
• Base responses strictly on fare rules 
• Apply the most restrictive conditions
• Use clear bullet points or numbered answers
• No assumptions beyond written rules`;

      document.getElementById('outputPrompt').value = promptText;
      showToast('Optimized prompt generated successfully!', 'success');
    });

    function copyPrompt() {
      const outputArea = document.getElementById('outputPrompt');
      const copyBtn = document.getElementById('copyBtn');

      if (!outputArea.value.trim()) {
        showToast('No generated prompt available to copy.', 'warning');
        return;
      }

      outputArea.select();
      navigator.clipboard.writeText(outputArea.value).then(() => {
        showToast('Prompt copied to clipboard!', 'success');
        
        const originalText = copyBtn.textContent;
        copyBtn.textContent = 'Copied! ✓';
        copyBtn.classList.add('btn-success-state');
        
        setTimeout(() => {
          copyBtn.textContent = originalText;
          copyBtn.classList.remove('btn-success-state');
        }, 2000);
      }).catch(() => {
        showToast('Failed to copy to clipboard.', 'error');
      });
    }
