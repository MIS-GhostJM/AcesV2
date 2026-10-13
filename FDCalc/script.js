let taxRowCount = 1; // Start with 1 for the initial row
const MAX_TAX_ROWS = 20;
const CONSTANTS = {
    COPY_SUCCESS_DURATION: 1000 // duration in milliseconds (2 seconds)
};

// Function to add a new tax row
function addTaxRow() {
    if (taxRowCount >= MAX_TAX_ROWS) {
        document.getElementById('maxTaxAlert').style.display = 'block';
        return;
    }

    taxRowCount++;
    const taxTableBody = document.getElementById('taxTableBody');
    const newRow = document.createElement('tr');
    newRow.id = `taxRow${taxRowCount}`;

    newRow.innerHTML = `
        <td><input type="text" id="taxType${taxRowCount}" maxlength="2" class="tax-type"></td>
        <td><input type="number" id="oldFare${taxRowCount}" placeholder="0.00" min="0" step="0.01"></td>
        <td><input type="number" id="newFare${taxRowCount}" placeholder="0.00" min="0" step="0.01"></td>
        <td id="taxDiff${taxRowCount}" class="currency">0.00</td>
        <td><button class="remove-tax-button" onclick="removeTaxRow(${taxRowCount})">Remove</button></td>
    `;

    taxTableBody.appendChild(newRow);
    addTaxRowEventListeners(taxRowCount);
    calculateFareDifference();
}

// Add event listeners to dynamically added tax rows
function addTaxRowEventListeners(rowNumber) {
    document.getElementById(`taxType${rowNumber}`).addEventListener('input', calculateFareDifference);
    document.getElementById(`oldFare${rowNumber}`).addEventListener('input', calculateFareDifference);
    document.getElementById(`newFare${rowNumber}`).addEventListener('input', calculateFareDifference);
}

// Function to remove a tax row
function removeTaxRow(rowIndex) {
    document.getElementById(`taxRow${rowIndex}`).remove();
    taxRowCount--;
    calculateFareDifference();
}

// Function to calculate the fare difference and update the tax breakdown
function calculateFareDifference() {
    const baseOldFare = parseFloat(document.getElementById('baseOldFare').value) || 0;
    const baseNewFare = parseFloat(document.getElementById('baseNewFare').value) || 0;
    const isFlexible = document.getElementById('flexibilitySelect').value === 'No';
    let airlinePenalty = parseFloat(document.getElementById('airlinePenalty').value) || 0;
    let serviceFee = parseFloat(document.getElementById('serviceFee').value) || 0;
    const gdscurrency = document.getElementById('gdscurrency').value || '';
    const serviceFeeCurrency = document.getElementById('serviceFeeCurrency').value || '';

    let totalBaseFare = baseNewFare - baseOldFare;
    let totalTaxDifference = 0;
    let totalFareDifference = 0;
    const taxBreakdown = [];

    for (let i = 1; i <= taxRowCount; i++) {
        const taxType = document.getElementById(`taxType${i}`).value;
        const oldFare = parseFloat(document.getElementById(`oldFare${i}`).value) || 0;
        const newFare = parseFloat(document.getElementById(`newFare${i}`).value) || 0;
        const taxDifference = newFare - oldFare;

        document.getElementById(`taxDiff${i}`).textContent = `${taxDifference.toFixed(2)} ${gdscurrency}`;
        if (taxDifference >= 0) totalTaxDifference += taxDifference;
        taxBreakdown.push({ type: taxType, difference: taxDifference });
    }

    if (totalBaseFare > 0) totalFareDifference += totalBaseFare;
    totalFareDifference += totalTaxDifference + airlinePenalty;

    // Show or hide airline penalty and service fee fields based on flexibility
    document.getElementById('airlinePenaltyRow').style.display = isFlexible ? 'flex' : 'none';
    document.getElementById('serviceFeeRow').style.display = isFlexible ? 'flex' : 'none';
    document.getElementById('serviceFeeCurrencyRow').style.display = isFlexible ? 'flex' : 'none';
    document.getElementById('serviceFeeCurrencyRow').style.display = isFlexible ? 'flex' : 'none';
    document.getElementById('Servicefeesummary').style.display = isFlexible? 'flex' : 'none';
    document.getElementById('Penaltysummary').style.display = isFlexible? 'flex' : 'none';
    


    document.getElementById('totalBaseFare').textContent = `${totalBaseFare > 0 ? totalBaseFare.toFixed(2) : '0.00'} ${gdscurrency}`;
    document.getElementById('Penaltysummary').querySelector('.currency').textContent = `${airlinePenalty.toFixed(2)} ${gdscurrency}`;
    document.getElementById('taxDifference').textContent = `${totalTaxDifference.toFixed(2)} ${gdscurrency}`;
    document.getElementById('totalFareDiff').textContent = `${totalFareDifference.toFixed(2)} ${gdscurrency}`;
    document.getElementById('totalBaseFareshow').textContent = `${totalBaseFare.toFixed(2)} ${gdscurrency}`;
    document.getElementById('Servicefeesummary').querySelector('.currency').textContent = `${serviceFee.toFixed(2)} ${serviceFeeCurrency}`;

    updateTaxBreakdown(taxBreakdown, taxBreakdown.every(t => !t.type && t.difference === 0), gdscurrency);
}

// Function to update the tax breakdown in the UI
function updateTaxBreakdown(taxBreakdown, isTaxTableUnchanged, gdscurrency) {
    const taxListElement = document.querySelector('.tax-list');
    taxListElement.innerHTML = '';

    if (isTaxTableUnchanged) {
        taxListElement.textContent = "No Tax Calculation Defined";
    } else {
        taxBreakdown.forEach(tax => {
            const taxElement = document.createElement('div');
            taxElement.textContent = `${tax.type || '--'}: Difference: ${tax.difference.toFixed(2)} ${gdscurrency}`;
            taxListElement.appendChild(taxElement);
        });
    }
}

// Function to generate summary text
function generateSummaryText() {
    const flexibilityValue = document.getElementById("flexibilitySelect").value;
    let summaryText = "Ticket Change Summary\n";
    summaryText += "=======================\n";
    summaryText += `Base Fare Difference: ${document.getElementById("totalBaseFareshow").innerText}\n`;
    if (flexibilityValue === "No") {
        summaryText += `Airline Penalty: ${document.getElementById("Penaltysummary").querySelector('.currency').innerText}\n`;
    }
    summaryText += `Overall Tax Difference: ${document.getElementById("taxDifference").innerText}\n`;
    summaryText += "=======================\n";
    summaryText += `Total Fare Difference: ${document.getElementById("totalFareDiff").innerText}\n`;
    if (flexibilityValue === "No") {
        summaryText += `Service Fee: ${document.getElementById("Servicefeesummary").querySelector('.currency').innerText}\n`;
    }

    summaryText += "\n***Tax Breakdown***\n";
    for (let i = 1; i <= taxRowCount; i++) {
        const taxType = document.getElementById(`taxType${i}`).value || "--";
        const oldFare = document.getElementById(`oldFare${i}`).value || "0.00";
        const newFare = document.getElementById(`newFare${i}`).value || "0.00";
        const taxDifference = document.getElementById(`taxDiff${i}`).textContent || "-.--";
        summaryText += `${taxType}: Old: ${oldFare}, New: ${newFare}, Difference: ${taxDifference}\n`;
    }
    return summaryText;
}

// Function to handle copy functionality
async function handleCopy() {
    const copyButton = document.getElementById('copyButton');
    const isFlexible = document.getElementById("flexibilitySelect").value === "No";
    const airlinePenalty = document.getElementById("airlinePenalty").value;
    const serviceFee = document.getElementById("serviceFee").value;
    const serviceFeeCurrency = document.getElementById("serviceFeeCurrency").value;
    const oldbasefare = document.getElementById('baseOldFare').value;
    const newbasefare = document.getElementById('baseNewFare').value;
    const gdscurrency = document.getElementById('gdscurrency').value;

    if (!newbasefare || !oldbasefare || !gdscurrency) {
        copyButton.classList.add('error');
        showTooltip('Please complete Base Fares and Currency Codes', copyButton);
        setTimeout(() => copyButton.classList.remove('error'), CONSTANTS.COPY_SUCCESS_DURATION);
        return;
    }  
    
    if (isFlexible && (!airlinePenalty || !serviceFee || !serviceFeeCurrency || !newbasefare || !oldbasefare || !gdscurrency )) {
        copyButton.classList.add('error');
        showTooltip('Please complete Base Fares, Airline Penalty, Service Fee, and Currency Codes', copyButton);
        setTimeout(() => copyButton.classList.remove('error'), CONSTANTS.COPY_SUCCESS_DURATION);
        return;
    }


    // Clear any previous tooltip to allow a new one
    document.querySelectorAll('.tooltip').forEach(tooltip => tooltip.remove());

    const summaryText = generateSummaryText();
    try {
        await navigator.clipboard.writeText(summaryText);
        copyButton.classList.add('success');
        showTooltip('Copied!', copyButton);
    } catch (err) {
        copyButton.classList.add('error');
        showTooltip('Failed to copy', copyButton);
    }

    setTimeout(() => copyButton.classList.remove('success', 'error'), CONSTANTS.COPY_SUCCESS_DURATION);
}


// Function to show tooltip feedback for actions
function showTooltip(message, element) {
    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip';
    tooltip.textContent = message;
    document.body.appendChild(tooltip);
    const rect = element.getBoundingClientRect();
    tooltip.style.left = `${rect.left + window.scrollX + rect.width / 2 - tooltip.offsetWidth / 2}px`;
    tooltip.style.top = `${rect.top + window.scrollY - tooltip.offsetHeight - 5}px`;
    
    setTimeout(() => tooltip.remove(), CONSTANTS.COPY_SUCCESS_DURATION);
}

// Function to reset all input fields and clear summaries
function handleReset() {
    document.getElementById('baseOldFare').value = '';
    document.getElementById('baseNewFare').value = '';
    document.getElementById('flexibilitySelect').value = 'Select';
    document.getElementById('airlinePenalty').value = '';
    document.getElementById('serviceFee').value = '';
    document.getElementById('gdscurrency').value = '';
    document.getElementById('serviceFeeCurrency').value = '';

    // Reset all tax rows except the first one
    while (taxRowCount > 1) {
        removeTaxRow(taxRowCount);
    }

    // Clear the first tax row
    document.getElementById('taxType1').value = '';
    document.getElementById('oldFare1').value = '';
    document.getElementById('newFare1').value = '';

    // Hide any alerts or tooltips
    document.getElementById('maxTaxAlert').style.display = 'none';

    // Reset calculations
    calculateFareDifference();
}

// Initialize event listeners
document.getElementById('baseOldFare').addEventListener('input', calculateFareDifference);
document.getElementById('baseNewFare').addEventListener('input', calculateFareDifference);
document.getElementById('flexibilitySelect').addEventListener('change', calculateFareDifference);
document.getElementById('airlinePenalty').addEventListener('input', calculateFareDifference);
document.getElementById('serviceFee').addEventListener('input', calculateFareDifference);
document.getElementById('gdscurrency').addEventListener('input', calculateFareDifference);
document.getElementById('serviceFeeCurrency').addEventListener('input', calculateFareDifference);
document.querySelector(".clear-fields-button").addEventListener('click', handleReset);
document.getElementById('copyButton').addEventListener('click', handleCopy);

// Initialize listeners for the inputs in the first tax row
document.getElementById('taxType1').addEventListener('input', calculateFareDifference);
document.getElementById('oldFare1').addEventListener('input', calculateFareDifference);
document.getElementById('newFare1').addEventListener('input', calculateFareDifference);

// Add the initial tax row and initialize the calculations on page load
document.addEventListener('DOMContentLoaded', () => {
    taxRowCount = 1;
    calculateFareDifference(); // Ensure initial calculation values are set
});
