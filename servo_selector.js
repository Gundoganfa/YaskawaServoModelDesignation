// Servo Motor Selector Application
let nomenclatureData = {
    'sigma-x': null,
    'sigma-7': null
};
let activePlatform = 'sigma-x'; // 'sigma-x' or 'sigma-7'
let currentSeries = null;
let currentTemplate = null;
let selections = {};

// Platform-specific element IDs
const platformElements = {
    'sigma-x': {
        seriesSelect: 'seriesSelect',
        templateType: 'templateType',
        dynamicFilters: 'dynamicFilters',
        seriesInfoBoxes: 'seriesInfoBoxes',
        partCode: 'partCode',
        segmentInfo: 'segmentInfo',
        completionPercentage: 'completionPercentage',
        progressFill: 'progressFill',
        copyButton: 'copyButton',
        resetButton: 'resetButton',
        statusMessage: 'statusMessage'
    },
    'sigma-7': {
        seriesSelect: 'seriesSelect7',
        templateType: 'templateType7',
        dynamicFilters: 'dynamicFilters7',
        seriesInfoBoxes: 'seriesInfoBoxes7',
        partCode: 'partCode7',
        segmentInfo: 'segmentInfo7',
        completionPercentage: 'completionPercentage7',
        progressFill: 'progressFill7',
        copyButton: 'copyButton7',
        resetButton: 'resetButton7',
        statusMessage: 'statusMessage7'
    }
};

// Get current nomenclature data
function getCurrentNomenclatureData() {
    return nomenclatureData[activePlatform];
}

// Get element ID for current platform
function getElementId(key) {
    return platformElements[activePlatform][key];
}

// Initialize the application
async function init() {
    try {
        // Load both JSON files
        const sigmaXResponse = await fetch('sigma_x_series_nomenclature.json');
        nomenclatureData['sigma-x'] = await sigmaXResponse.json();
        
        const sigma7Response = await fetch('sigma_7_series_nomenclature.json');
        nomenclatureData['sigma-7'] = await sigma7Response.json();
        
        setupEventListeners();
        updateDisplay();
    } catch (error) {
        console.error('Error loading nomenclature data:', error);
        alert('Veri dosyası yüklenemedi. Lütfen JSON dosyalarının aynı klasörde olduğundan emin olun.');
    }
}

// Select a motor series
function selectSeries(seriesName) {
    // Reset selections if changing series
    if (currentSeries !== seriesName) {
        currentSeries = seriesName;
        currentTemplate = null;
        selections = {};
        
        // Automatically set the motor model (segment 'a')
        if (seriesName) {
            selections['a'] = seriesName;
        }
        
        renderTemplateSelector();
        renderDynamicFilters();
        updateDisplay();
    }
}

// Render template type selector
function renderTemplateSelector() {
    const templateType = document.getElementById(getElementId('templateType'));
    
    if (!currentSeries) {
        templateType.disabled = true;
        templateType.innerHTML = '<option value="">Önce motor tipi seçiniz...</option>';
        return;
    }
    
    const data = getCurrentNomenclatureData();
    const templates = data.series[currentSeries].part_number_templates;
    templateType.disabled = false;
    
    templateType.innerHTML = '<option value="">Konfigürasyon tipi seçiniz...</option>';
    
    const templateNames = {
        'standard': 'Standart Konfigürasyon',
        'exclusive_customer': 'Müşteriye Özel',
        'exclusive_customer_with_region_options': 'Müşteriye Özel (Bölge Seçenekli)',
        'with_gear': 'Dişli Sistemli',
        'with_gear_exclusive_customer': 'Dişli Sistemli (Müşteriye Özel)',
        'with_gear_exclusive_customer_with_region_options': 'Dişli Sistemli (Müşteriye Özel, Bölge Seçenekli)'
    };
    
    Object.keys(templates).forEach(templateKey => {
        const option = document.createElement('option');
        option.value = templateKey;
        option.textContent = templateNames[templateKey] || templateKey;
        templateType.appendChild(option);
    });
}

// Render dynamic filters based on selected template
function renderDynamicFilters() {
    const container = document.getElementById(getElementId('dynamicFilters'));
    const infoBoxes = document.getElementById(getElementId('seriesInfoBoxes'));
    
    if (!currentSeries || !currentTemplate) {
        container.innerHTML = '';
        if (infoBoxes) {
            infoBoxes.style.display = 'grid';
        }
        return;
    }
    
    if (infoBoxes) {
        infoBoxes.style.display = 'none';
    }
    
    const data = getCurrentNomenclatureData();
    const template = data.series[currentSeries].part_number_templates[currentTemplate];
    const segments = data.series[currentSeries].segments;
    
    container.innerHTML = '';
    
    let displayIndex = 1;
    
    template.forEach((segmentKey, index) => {
        const segment = segments[segmentKey];
        if (!segment) return;
        
        // Skip segment 'a' (Motor Model) as it's already selected
        if (segmentKey === 'a') {
            return;
        }
        
        const filterGroup = document.createElement('div');
        filterGroup.className = 'filter-group';
        
        const label = document.createElement('label');
        label.className = 'filter-label';
        label.textContent = `${displayIndex}. ${segment.item}`;
        displayIndex++;
        
        const select = document.createElement('select');
        select.className = 'filter-select';
        select.dataset.segment = segmentKey;
        select.dataset.index = index;
        
        // Add default option
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = 'Seçiniz...';
        select.appendChild(defaultOption);
        
        // Populate options based on segment type
        if (segment.values) {
            if (typeof segment.values === 'object' && !Array.isArray(segment.values)) {
                // Handle different types of value structures
                if (segmentKey === 'b' && currentSeries === 'SGMXG') {
                    // Special handling for SGMXG power output
                    Object.entries(segment.values).forEach(([code, speeds]) => {
                        let displayText = code;
                        if (typeof speeds === 'object') {
                            const powerValues = Object.values(speeds).filter(v => v !== null);
                            if (powerValues.length > 0) {
                                displayText += ` - ${powerValues.join('/')} kW`;
                            }
                        }
                        const option = document.createElement('option');
                        option.value = code;
                        option.textContent = displayText;
                        select.appendChild(option);
                    });
                } else if (segmentKey === 'g' && currentSeries === 'SGMXP' && segment.values_for_80_400W) {
                    // Special handling for SGMXP optional specifications
                    Object.entries(segment.values_for_80_400W).forEach(([code, desc]) => {
                        const option = document.createElement('option');
                        option.value = code;
                        option.textContent = `${code} - ${desc}`;
                        select.appendChild(option);
                    });
                } else if (segmentKey === 'o' && segment.values_by_gear_type) {
                    // Handle gear reduction ratios
                    Object.entries(segment.values_by_gear_type).forEach(([gearType, data]) => {
                        const optgroup = document.createElement('optgroup');
                        optgroup.label = gearType;
                        Object.entries(data.codes).forEach(([code, desc]) => {
                            const option = document.createElement('option');
                            option.value = code;
                            option.textContent = `${code} - ${desc}`;
                            optgroup.appendChild(option);
                        });
                        select.appendChild(optgroup);
                    });
                } else {
                    // Standard object values
                    Object.entries(segment.values).forEach(([code, desc]) => {
                        const option = document.createElement('option');
                        option.value = code;
                        
                        if (typeof desc === 'number') {
                            option.textContent = `${code} - ${desc} W`;
                        } else {
                            option.textContent = `${code} - ${desc}`;
                        }
                        
                        select.appendChild(option);
                    });
                }
            } else if (typeof segment.values === 'string') {
                // Handle string descriptions (like "A-Z")
                const info = document.createElement('div');
                info.style.color = '#666';
                info.style.fontSize = '0.9rem';
                info.style.marginTop = '5px';
                info.textContent = `Format: ${segment.values}`;
                
                const input = document.createElement('input');
                input.type = 'text';
                input.className = 'filter-input';
                input.dataset.segment = segmentKey;
                input.dataset.index = index;
                input.placeholder = segment.values;
                input.maxLength = 1;
                
                input.addEventListener('input', (e) => {
                    handleInputChange(segmentKey, e.target.value.toUpperCase());
                    e.target.value = e.target.value.toUpperCase();
                });
                
                filterGroup.appendChild(label);
                filterGroup.appendChild(input);
                filterGroup.appendChild(info);
                container.appendChild(filterGroup);
                return;
            }
        }
        
        select.addEventListener('change', (e) => {
            handleSelectionChange(segmentKey, e.target.value);
        });
        
        filterGroup.appendChild(label);
        filterGroup.appendChild(select);
        container.appendChild(filterGroup);
    });
}

// Handle selection change
function handleSelectionChange(segmentKey, value) {
    if (value) {
        selections[segmentKey] = value;
    } else {
        delete selections[segmentKey];
    }
    updateDisplay();
}

// Handle input change
function handleInputChange(segmentKey, value) {
    if (value) {
        selections[segmentKey] = value;
    } else {
        delete selections[segmentKey];
    }
    updateDisplay();
}

// Update the display with current selections
function updateDisplay() {
    updatePartCode();
    updateSegmentInfo();
    updateCompletionStatus();
}

// Update the part code display
function updatePartCode() {
    const partCodeElement = document.getElementById(getElementId('partCode'));
    
    if (!currentSeries || !currentTemplate) {
        partCodeElement.innerHTML = '<span style="opacity: 0.5;">Lütfen seçim yapınız</span>';
        return;
    }
    
    const data = getCurrentNomenclatureData();
    const template = data.series[currentSeries].part_number_templates[currentTemplate];
    const segments = data.series[currentSeries].segments;
    
    let code = '';
    let allSelected = true;
    
    template.forEach((segmentKey, index) => {
        const segment = segments[segmentKey];
        if (!segment) return;
        
        if (selections[segmentKey]) {
            code += selections[segmentKey];
        } else {
            // Show placeholder
            if (segmentKey === 'a') {
                // Motor model is always known
                code += Object.keys(segment.values)[0];
            } else {
                code += '_';
                allSelected = false;
            }
        }
        
        // Add hyphen after motor model (first segment)
        if (index === 0) {
            code += '-';
        }
    });
    
    // Render code with segments highlighted
    let html = '';
    for (let char of code) {
        if (char === '_') {
            html += `<span class="part-segment empty">${char}</span>`;
        } else {
            html += `<span class="part-segment selected">${char}</span>`;
        }
    }
    
    partCodeElement.innerHTML = html;
    
    // Enable/disable copy button
    document.getElementById(getElementId('copyButton')).disabled = !allSelected;
}

// Update segment information display
function updateSegmentInfo() {
    const segmentInfoElement = document.getElementById(getElementId('segmentInfo'));
    
    if (!currentSeries || !currentTemplate || Object.keys(selections).length === 0) {
        segmentInfoElement.innerHTML = '<div style="opacity: 0.7; text-align: center;">Seçimleriniz burada görünecek</div>';
        return;
    }
    
    const data = getCurrentNomenclatureData();
    const segments = data.series[currentSeries].segments;
    let html = '';
    
    Object.entries(selections).forEach(([segmentKey, value]) => {
        const segment = segments[segmentKey];
        if (!segment) return;
        
        let description = value;
        
        if (segment.values && typeof segment.values === 'object') {
            if (segmentKey === 'b' && currentSeries === 'SGMXG') {
                // SGMXG power output
                const speeds = segment.values[value];
                if (typeof speeds === 'object') {
                    const powerValues = Object.entries(speeds)
                        .filter(([_, v]) => v !== null)
                        .map(([speed, power]) => `${power}kW @ ${speed}`)
                        .join(', ');
                    description = powerValues || value;
                }
            } else if (segment.values[value] !== undefined) {
                const val = segment.values[value];
                if (typeof val === 'number') {
                    description = `${val} W`;
                } else {
                    description = val;
                }
            } else if (segmentKey === 'o' && segment.values_by_gear_type) {
                // Gear reduction ratio
                let found = false;
                Object.entries(segment.values_by_gear_type).forEach(([gearType, data]) => {
                    if (data.codes[value]) {
                        description = data.codes[value];
                        found = true;
                    }
                });
                if (!found) description = value;
            }
        }
        
        html += `
            <div class="segment-info-item">
                <div class="segment-info-label">${segment.item}</div>
                <div class="segment-info-value">${description}</div>
            </div>
        `;
    });
    
    segmentInfoElement.innerHTML = html;
}

// Update completion status
function updateCompletionStatus() {
    if (!currentSeries || !currentTemplate) {
        document.getElementById(getElementId('completionPercentage')).textContent = '0%';
        document.getElementById(getElementId('progressFill')).style.width = '0%';
        return;
    }
    
    const data = getCurrentNomenclatureData();
    const template = data.series[currentSeries].part_number_templates[currentTemplate];
    const totalSegments = template.length;
    const selectedSegments = Object.keys(selections).length;
    
    const percentage = Math.round((selectedSegments / totalSegments) * 100);
    
    document.getElementById(getElementId('completionPercentage')).textContent = `${percentage}%`;
    document.getElementById(getElementId('progressFill')).style.width = `${percentage}%`;
}

// Decode a part number
function decodePartNumber(code) {
    // Remove spaces and hyphens for parsing, but keep original for display
    const cleanCode = code.replace(/[\s-]/g, '').toUpperCase();
    const originalCode = code.trim().toUpperCase();
    
    // Try to identify the series and platform
    let detectedSeries = null;
    let seriesLength = 0;
    let detectedPlatform = null;
    
    // Check both platforms
    for (const platform of ['sigma-x', 'sigma-7']) {
        const data = nomenclatureData[platform];
        if (!data) continue;
        
        for (const seriesName of Object.keys(data.series)) {
            if (cleanCode.startsWith(seriesName)) {
                detectedSeries = seriesName;
                seriesLength = seriesName.length;
                detectedPlatform = platform;
                break;
            }
        }
        if (detectedSeries) break;
    }
    
    if (!detectedSeries) {
        // Try to detect series even with wildcards
        for (const platform of ['sigma-x', 'sigma-7']) {
            const data = nomenclatureData[platform];
            if (!data) continue;
            
            for (const seriesName of Object.keys(data.series)) {
                const seriesPattern = seriesName.split('').join('.*');
                const regex = new RegExp(`^${seriesPattern}`, 'i');
                if (regex.test(cleanCode.replace(/\?/g, '.'))) {
                    detectedSeries = seriesName;
                    seriesLength = seriesName.length;
                    detectedPlatform = platform;
                    break;
                }
            }
            if (detectedSeries) break;
        }
    }
    
    if (!detectedSeries) {
        throw new Error('Motor serisi tanımlanamadı. Lütfen geçerli bir Sigma-X (SGMXA, SGMXJ, SGMXG, SGMXP) veya Sigma-7 (SGM7A, SGM7J, SGM7G, SGM7P) kodu girin.');
    }
    
    const platformData = nomenclatureData[detectedPlatform];
    const seriesData = platformData.series[detectedSeries];
    const segments = seriesData.segments;
    
    // Try to match against templates
    let matchedTemplate = null;
    let templateName = null;
    
    for (const [tName, template] of Object.entries(seriesData.part_number_templates)) {
        // Calculate expected length
        let expectedLength = seriesLength;
        template.forEach(segKey => {
            if (segKey === 'a') return; // Already counted in seriesLength
            expectedLength += 1; // Most segments are 1 char
            if (segKey === 'o' || segKey === 'g') {
                // These might be 2 chars in some cases
                expectedLength += 1; // Allow for flexibility
            }
        });
        
        // More flexible matching
        if (cleanCode.length >= seriesLength && cleanCode.length <= expectedLength + 2) {
            matchedTemplate = template;
            templateName = tName;
            break;
        }
    }
    
    if (!matchedTemplate) {
        // Use standard template as fallback
        matchedTemplate = seriesData.part_number_templates.standard;
        templateName = 'standard (otomatik tahmin)';
    }
    
    // Parse the code
    const result = {
        series: detectedSeries,
        template: templateName,
        segments: [],
        fullCode: originalCode
    };
    
    let position = seriesLength;
    
    for (let i = 0; i < matchedTemplate.length; i++) {
        const segmentKey = matchedTemplate[i];
        const segment = segments[segmentKey];
        
        if (!segment) continue;
        
        // Skip first segment (motor model) as we already have it
        if (segmentKey === 'a') {
            result.segments.push({
                key: segmentKey,
                label: segment.item,
                code: detectedSeries,
                description: segment.values[detectedSeries] || detectedSeries
            });
            continue;
        }
        
        // Try to extract segment value
        let segmentValue = '';
        let description = '';
        
        // Handle different segment types
        if (segmentKey === 'b') {
            // Motor output - can be 2 chars
            segmentValue = cleanCode.substr(position, 2);
            position += 2;
            
            // Check for wildcards
            if (segmentValue.includes('?')) {
                description = '❓ Belirtilmemiş (?)';
            } else if (segment.values && segment.values[segmentValue] !== undefined) {
                const val = segment.values[segmentValue];
                if (detectedSeries === 'SGMXG' && typeof val === 'object') {
                    const powerValues = Object.entries(val)
                        .filter(([_, v]) => v !== null)
                        .map(([speed, power]) => `${power}kW @ ${speed}`)
                        .join(', ');
                    description = powerValues;
                } else if (typeof val === 'number') {
                    description = `${val} W`;
                } else {
                    description = val;
                }
            } else {
                description = 'Bilinmeyen değer';
            }
        } else if (segmentKey === 'o') {
            // Gear ratio - can be 1-2 chars
            segmentValue = cleanCode.substr(position, 1);
            
            if (segmentValue === '?') {
                description = '❓ Belirtilmemiş (?)';
                position += 1;
            } else if (segment.values && segment.values[segmentValue]) {
                description = segment.values[segmentValue];
                position += 1;
            } else if (segment.values_by_gear_type) {
                // Try to find in gear types
                let found = false;
                for (const [gearType, data] of Object.entries(segment.values_by_gear_type)) {
                    if (data.codes[segmentValue]) {
                        description = data.codes[segmentValue];
                        found = true;
                        break;
                    }
                }
                if (found) {
                    position += 1;
                } else {
                    segmentValue = cleanCode.substr(position, 2);
                    if (segmentValue.includes('?')) {
                        description = '❓ Belirtilmemiş (?)';
                    } else {
                        description = 'Özel redüksiyon oranı';
                    }
                    position += 2;
                }
            } else {
                position += 1;
                description = 'Bilinmeyen değer';
            }
        } else if (segmentKey === 'g' && detectedSeries === 'SGMXP') {
            // SGMXP optional specs - can be 1-2 chars
            segmentValue = cleanCode.substr(position, 1);
            
            if (segmentValue === '?') {
                description = '❓ Belirtilmemiş (?)';
                position += 1;
            } else if (segment.values_for_80_400W && segment.values_for_80_400W[segmentValue]) {
                description = segment.values_for_80_400W[segmentValue];
                position += 1;
            } else {
                // Try 2 chars
                segmentValue = cleanCode.substr(position, 2);
                if (segmentValue.includes('?')) {
                    description = '❓ Belirtilmemiş (?)';
                } else if (segment.values_for_750_1500W) {
                    description = 'Kablo uzunluğu ve konektör tipi seçeneği';
                } else {
                    description = 'Bilinmeyen değer';
                }
                position += 2;
            }
        } else {
            // Standard 1-char segments
            if (position >= cleanCode.length) {
                break; // No more characters
            }
            
            segmentValue = cleanCode.substr(position, 1);
            position += 1;
            
            if (segmentValue === '?') {
                description = '❓ Belirtilmemiş (?)';
            } else if (segment.values && typeof segment.values === 'object') {
                if (segment.values[segmentValue] !== undefined) {
                    const val = segment.values[segmentValue];
                    if (typeof val === 'number') {
                        description = `${val} W`;
                    } else {
                        description = val;
                    }
                } else {
                    description = 'Bilinmeyen değer';
                }
            } else if (typeof segment.values === 'string') {
                description = `Format: ${segment.values}`;
            } else {
                description = 'Özel kod';
            }
        }
        
        result.segments.push({
            key: segmentKey,
            label: segment.item,
            code: segmentValue,
            description: description
        });
    }
    
    return result;
}

// Render decoded result
function renderDecodedResult(result) {
    const container = document.getElementById('decodedResult');
    
    const seriesNames = {
        'SGMXA': 'Sigma-X Genel Amaçlı Servo Motor',
        'SGMXJ': 'Sigma-X Düşük Kapasite Servo Motor',
        'SGMXG': 'Sigma-X Yüksek Kapasite Servo Motor',
        'SGMXP': 'Sigma-X Premium Servo Motor',
        'SGM7A': 'Sigma-7 Genel Amaçlı Servo Motor',
        'SGM7J': 'Sigma-7 Düşük Kapasite Servo Motor',
        'SGM7G': 'Sigma-7 Yüksek Kapasite Servo Motor',
        'SGM7P': 'Sigma-7 Premium Servo Motor'
    };
    
    let html = `
        <div class="decoded-result">
            <div class="decoded-header">
                <div class="decoded-model">${result.fullCode}</div>
                <div class="decoded-series-name">${seriesNames[result.series] || result.series}</div>
            </div>
    `;
    
    result.segments.forEach((seg, index) => {
        const isUnknown = seg.code.includes('?') || seg.description.includes('❓');
        const itemClass = isUnknown ? 'decoded-item unknown' : 'decoded-item';
        
        html += `
            <div class="${itemClass}">
                <div class="decoded-label">${index + 1}. ${seg.label}</div>
                <div class="decoded-code">${seg.code}</div>
                <div class="decoded-description">${seg.description}</div>
            </div>
        `;
    });
    
    html += `</div>`;
    container.innerHTML = html;
}

// Handle decode button
function handleDecode() {
    const codeInput = document.getElementById('codeInput');
    const code = codeInput.value.trim();
    const resultContainer = document.getElementById('decodedResult');
    
    if (!code) {
        resultContainer.innerHTML = `
            <div class="error-message">
                ⚠️ Lütfen bir motor kodu girin.
            </div>
        `;
        return;
    }
    
    try {
        const result = decodePartNumber(code);
        renderDecodedResult(result);
    } catch (error) {
        resultContainer.innerHTML = `
            <div class="error-message">
                ❌ Hata: ${error.message}
            </div>
        `;
    }
}

// Switch tabs
function switchTab(tabName, seriesType = null) {
    // Update tab buttons
    document.querySelectorAll('.nav-tab').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    if (tabName === 'encoder') {
        if (seriesType === 'sigma-x') {
            activePlatform = 'sigma-x';
            document.getElementById('sigmaXTab').classList.add('active');
            document.querySelector('[data-series="sigma-x"]').classList.add('active');
        } else if (seriesType === 'sigma-7') {
            activePlatform = 'sigma-7';
            document.getElementById('sigma7Tab').classList.add('active');
            document.querySelector('[data-series="sigma-7"]').classList.add('active');
        }
        
        // Reset selections when switching platforms
        currentSeries = null;
        currentTemplate = null;
        selections = {};
        updateDisplay();
        
    } else if (tabName === 'decoder') {
        document.getElementById('decoderTab').classList.add('active');
        document.querySelector('[data-tab="decoder"]').classList.add('active');
    }
}

// Setup event listeners
function setupEventListeners() {
    // Tab switching
    document.querySelectorAll('.nav-tab').forEach(btn => {
        btn.addEventListener('click', () => {
            const tabType = btn.dataset.tab;
            const seriesType = btn.dataset.series;
            switchTab(tabType, seriesType);
        });
    });
    
    // Setup for both platforms
    setupPlatformEventListeners('sigma-x');
    setupPlatformEventListeners('sigma-7');
    
    // Decoder
    document.getElementById('decodeButton').addEventListener('click', handleDecode);
    document.getElementById('codeInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleDecode();
        }
    });
}

// Setup event listeners for a specific platform
function setupPlatformEventListeners(platform) {
    const elements = platformElements[platform];
    
    // Series selection
    document.getElementById(elements.seriesSelect).addEventListener('change', (e) => {
        if (activePlatform === platform) {
            selectSeries(e.target.value);
        }
    });
    
    // Template selection
    document.getElementById(elements.templateType).addEventListener('change', (e) => {
        if (activePlatform === platform) {
            currentTemplate = e.target.value;
            selections = {};
            renderDynamicFilters();
            updateDisplay();
        }
    });
    
    // Copy button
    document.getElementById(elements.copyButton).addEventListener('click', () => {
        if (activePlatform === platform) {
            const partCode = document.getElementById(elements.partCode).textContent.replace(/\s+/g, '');
            
            navigator.clipboard.writeText(partCode).then(() => {
                const statusMessage = document.getElementById(elements.statusMessage);
                statusMessage.textContent = '✓ Kod kopyalandı!';
                statusMessage.className = 'status-message success';
                
                setTimeout(() => {
                    statusMessage.className = 'status-message';
                }, 3000);
            }).catch(err => {
                alert('Kopyalama başarısız: ' + err);
            });
        }
    });
    
    // Reset button
    document.getElementById(elements.resetButton).addEventListener('click', () => {
        if (activePlatform === platform) {
            // Reset selections
            currentSeries = null;
            currentTemplate = null;
            selections = {};
            
            // Reset UI
            document.getElementById(elements.seriesSelect).value = '';
            document.getElementById(elements.templateType).value = '';
            document.getElementById(elements.templateType).disabled = true;
            document.getElementById(elements.dynamicFilters).innerHTML = '';
            
            const infoBoxes = document.getElementById(elements.seriesInfoBoxes);
            if (infoBoxes) {
                infoBoxes.style.display = 'grid';
            }
            
            updateDisplay();
        }
    });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', init);


