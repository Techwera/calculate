document.addEventListener('DOMContentLoaded', function () {

        const tabButtons = document.querySelectorAll('.tab-header button');
        const tabSections = document.querySelectorAll('.form-section');
        tabButtons.forEach(button => {
            button.addEventListener('click', function () {
                const tabName = this.getAttribute('data-tab');

                tabButtons.forEach(btn => btn.classList.remove('active'));
                tabSections.forEach(section => section.classList.remove('active'));

                this.classList.add('active');
                document.querySelector(`.form-section[data-content="${tabName}"]`).classList.add('active');
            });
        });

        window.setDustLayer = function(layer) {
            document.getElementById('dust_layer_input').value = layer;
        };

        const companySelect = document.getElementById('companySelect');
        const companyIdInput = document.getElementById('companyId');
        if (companySelect && companyIdInput) {
            companySelect.addEventListener('change', function () {
                const selectedOption = this.options[this.selectedIndex];
                const id = selectedOption.getAttribute('data-id');
                companyIdInput.value = id;
            });
        }

        let dataRows = [];
        let selectedRow = null;
        const table = document.getElementById('dataGridView1');
        const tableBody = table.querySelector('tbody');
        
        document.getElementById('addConsumableBtn')?.addEventListener('click', function () {
            const name = document.getElementById('consumableName').value.trim();
            if (!name) return; // prevent empty rows

            const typeSelect = document.getElementById('consumableType');
            const unitInSelect = document.getElementById('unitIn');

            const type = typeSelect.options[typeSelect.selectedIndex]?.text || '';
            const unitIn = unitInSelect.options[unitInSelect.selectedIndex]?.text || '';

            const quantity = parseFloat(document.getElementById('quantity').value) || 0;
            const weightPerUnit = parseFloat(document.getElementById('weightPerUnit').value) || 0;

            const newRow = {
                ROW_SERIES: name,
                type,
                unitIn,
                quantity,
                weightPerUnit1: weightPerUnit,
                weightPerUnit,
                totalWeight : weightPerUnit * quantity,
                isNew: true
            };

            // Push only once
             dataRows.push(newRow);
                addRowToTable(newRow, dataRows.length - 1);

                // âœ… recalc all rows
                updateTotalWeight();

                tableBody.addEventListener('input', e => {
                    if (e.target.classList.contains('total-weight-cell')) {
                        updateTotalWeight();
                    }
                    });

            // Clear inputs
            document.getElementById('consumableName').value = '';
            document.getElementById('consumableType').selectedIndex = 0;
            document.getElementById('unitIn').selectedIndex = 0;
            document.getElementById('quantity').value = '';
            document.getElementById('weightPerUnit').value = '';
        });

        document.getElementById('bag_size')?.addEventListener('change', function () {
            const selectedType = this.value;

            dataRows = dataRows.filter((row, index) => {
                if (row.ROW_SERIES === 'TYPE_C' && row.isNew) {
                    const tableRow = document.querySelector(`#dataGridView1 tbody tr[data-index='${index}']`);
                    if (tableRow) tableRow.remove();
                    return false; 
                }
                return true; 
            });

            if (selectedType === 'TYPE_C') {
                const newRow = {
                    ROW_SERIES: 'TYPE_C',
                    type: '', unitIn: '', quantity: '',
                    weightPerUnit1: '', cutSize: '', fabricWeight: '',
                    lamiWeight: '', totalWeight: 60, thread: '',
                    hemming: '', dustProof: '', felt: '', remarks: '',
                    isNew: true
                };
                dataRows.push(newRow);
                addRowToTable(newRow, dataRows.length - 1);
            }
            updateTotalWeight();
        });

        function addRowToTable(row, index) {
            const tr = document.createElement('tr');
            tr.dataset.index = index;
            tr.dataset.isNew = row.isNew ? 'true' : 'false';

            tr.innerHTML = `
                <td>${row.ROW_SERIES || '0'}</td>
                <td></td>
                <td contenteditable="true">${row.type || '0'}</td>
                <td contenteditable="true">${row.unitIn || '0'}</td>
                <td contenteditable="true">${row.quantity || '0'}</td>
                <td contenteditable="true">${row.weightPerUnit1 || '0'}</td>
                <td contenteditable="true">${row.fabricWeight || '0'}</td>
                <td contenteditable="true">${row.lamiWeight || '0'}</td>
                <td contenteditable="true" class="total-weight-cell">${row.totalWeight || '0'}</td>
                <td contenteditable="true">${row.thread || '0'}</td>
                <td contenteditable="true">${row.hemming || '0'}</td>
                <td contenteditable="true">${row.dustProof || '0'}</td>
                <td contenteditable="true">${row.felt || '0'}</td>
                <td contenteditable="true">${row.remarks || '0'}</td>
                 <td contenteditable="true">${row.system_remarks || '0'}</td>
                <td contenteditable="true">${row.type_c|| '0'}</td>
                <td contenteditable="true">${row.type_d|| '0'}</td>
            `;
            tableBody.appendChild(tr);
            addDropdownToRow(tr);
        }

        function updateTotalWeight() {
            let currentTotal = 0;

          
            const totalWeightDisplay = document.getElementById('totalWeightDisplay');
            if (totalWeightDisplay && totalWeightDisplay.textContent.trim() !== '') {
                currentTotal = parseFloat(totalWeightDisplay.textContent) || 0;
            }

            let newWeight = 0;
            document.querySelectorAll('.total-weight-cell').forEach(cell => {
                const val = parseFloat(cell.textContent) || 0;
                newWeight += val;
            });

            // Final total: old + new
            const finalTotal = currentTotal + newWeight;

            // Update display
            if (totalWeightDisplay) {
                totalWeightDisplay.textContent = Math.round(finalTotal);
            }
        }

        // Function to sum up all totalWeight cells and display it somewhere
       
        // ðŸ”¹ Dropdown function
        function addDropdownToRow(row) {
            const colorCell = row.cells[1]; // 2nd column
            if (colorCell) {
                const select = document.createElement("select");
                select.className = "form-select";
                select.style.width = "100%";
                select.style.padding = "2px";

                const colors = ["", "Red", "Blue", "Green", "Black", "White", "Grey"];
                colors.forEach((color) => {
                    const option = document.createElement("option");
                    option.value = color;
                    option.textContent = color;
                    select.appendChild(option);
                });

                colorCell.innerHTML = "";
                colorCell.appendChild(select);
            }
        }

        


        tableBody.addEventListener('click', function (e) {
            const tr = e.target.closest('tr');
            if (!tr) return;
            if (selectedRow) selectedRow.classList.remove('selected');
            selectedRow = tr;
            selectedRow.classList.add('selected');
        });

        // ðŸ”¹ Laptop delete (Delete key)
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Delete' && selectedRow) {
                const index = parseInt(selectedRow.dataset.index);
                if (selectedRow.dataset.isNew === 'true' && !isNaN(index)) {
                    dataRows.splice(index, 1);
                    selectedRow.remove();
                    selectedRow = null;
                    updateTotalWeight();
                }
            }
        });

        // ðŸ”¹ Mobile delete (double tap)
        tableBody.addEventListener('dblclick', function(e) {
            const tr = e.target.closest('tr');
            if (!tr) return;

            if (tr.dataset.isNew === 'true') {
                const index = parseInt(tr.dataset.index);
                if (!isNaN(index)) {
                    if (confirm("Do you want to delete this row?")) {
                        dataRows.splice(index, 1);
                        tr.remove();
                        updateTotalWeight();
                    }
                }
            }
        });

        table.addEventListener('keydown', function (e) {
            const cell = e.target.closest('td[contenteditable="true"]');
            if (!cell) return;

            const columnIndex = cell.cellIndex;
            const currentRow = cell.closest('tr');
            const allRows = Array.from(table.querySelectorAll('tbody tr'));
            const currentRowIndex = allRows.indexOf(currentRow);

            const navTo = (rowOffset, colOffset = 0) => {
                const targetRow = allRows[currentRowIndex + rowOffset];
                if (targetRow && targetRow.cells[columnIndex + colOffset]?.isContentEditable) {
                    targetRow.cells[columnIndex + colOffset].focus();
                }
            };

            switch (e.key) {
                case 'Enter':
                case 'ArrowDown': e.preventDefault(); navTo(1); break;
                case 'ArrowUp': e.preventDefault(); navTo(-1); break;
                case 'ArrowLeft': e.preventDefault(); navTo(0, -1); break;
                case 'ArrowRight': e.preventDefault(); navTo(0, 1); break;
            }
        });

        const form = document.getElementById('mainform');
        const hiddenInput = document.getElementById('consumablesDataInput');
        if (form && hiddenInput) {
            form.addEventListener('submit', function (e) {
                const rows = [];
                table.querySelectorAll('tbody tr').forEach(row => {
                    const cells = row.cells;
                    if (cells.length >= 14) {
                        rows.push({
                            bag_component: cells[0].textContent.trim(),
                            color_name: cells[1].querySelector('select')?.value.trim() || '',
                            fabric_gsm: cells[2].textContent.trim(),
                            lamination: cells[3].textContent.trim(),
                            fabric_size: cells[4].textContent.trim(),
                            cut_size: cells[5].textContent.trim(),
                            fabric_weight: cells[6].textContent.trim(),
                            lami_weight: cells[7].textContent.trim(),
                            total_weight: cells[8].textContent.trim(),
                            thread: cells[9].textContent.trim(),
                            hemming: cells[10].textContent.trim(),
                            dust_proof: cells[11].textContent.trim(),
                            felt: cells[12].textContent.trim(),
                            marketing_remarks: cells[13].textContent.trim(),
                            system_remarks: cells[14].textContent.trim(),
                            type_c: cells[14].textContent.trim(),
                            type_d: cells[16].textContent.trim(),
                        });
                    }
                });

                hiddenInput.value = JSON.stringify(rows);
               ('Form data:', hiddenInput.value);
            });
        }
	

        const buttons = document.querySelectorAll('.tab-header button');
        const sections = document.querySelectorAll('.form-section');

        buttons.forEach(btn => {
            btn.addEventListener('click', () => {
                buttons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const tab = btn.getAttribute('data-tab');
                sections.forEach(section => {
                    section.classList.remove('active');
                    if (section.getAttribute('data-content') === tab) {
                        section.classList.add('active');
                    }
                });
            });
        });

        document.addEventListener("DOMContentLoaded", function () {
            const buttons = document.querySelectorAll('.tab-header1 button');
            const sections = document.querySelectorAll('.form-section1');

            buttons.forEach(btn => {
                btn.addEventListener("click", () => {
                    buttons.forEach(b => b.classList.remove("active"));
                    btn.classList.add("active");

                    const tab = btn.getAttribute("data-tab");
                    sections.forEach(sections => {
                        sections.classList.remove("active");
                        if (sections.getAttribute("data-content") === tab) {
                            sections.classList.add("active");
                        }
                    });
                });
            });
        });

        document.addEventListener("DOMContentLoaded", function () {
            const triggerFields = [
                "fs_rope", "skirt_box", "size_l_box", "size_W_box", "sf", "swl"
            ];
            triggerFields.forEach(id => {
                const el = document.getElementById(id);
                if (el) {
                    el.addEventListener(el.tagName === 'SELECT' ? 'change' : 'input', updateGridValues);
                }
            });
        });

        document.addEventListener("DOMContentLoaded", function () {
            const inputs = [
                'size_l_box', 'size_W_box', 'size_H_box', 'bag_type', 'sf', 'swl',
                'l_int_type', 'h_unit', 'UN_checkbox', 'short_length_loop_box',
                'long_length_loop_box', 'fs_rope', 'skirt_box', 'skirt_box_rope',
                'f_s_size_D_box', 'f_s_size_H_box', 'ds_rope', 'ds_size_D_box',
                'ds_size_H_box', 'hemm_fs_select', 'hemm_fs_rope', 'hemm_ds_select',
                'hemm_ds_rope', 'hygiene', 'topFlap', 'bottomFlap', 'baffle_construction_type',
                'baffle_fabric_type', 'liner_design_box', 'liner_microns_box', 'attachment'
            ];

            inputs.forEach(id => {
                const element = document.getElementById(id);
                if (element) {
                    element.addEventListener('change', updateGridValues);
                    element.addEventListener('input', updateGridValues);
                }
            });

            document.querySelectorAll('input[type="checkbox"], input[type="radio"]').forEach(el => {
                el.addEventListener('change', updateGridValues);
            });
        });

        document.addEventListener('DOMContentLoaded', function() {
            updateGridValues(); // Initial calculation
        });
        document.getElementById('calculateBtn').addEventListener('click', function() {
            updateGridValues();
        });



        function updateGridValues() {   
            const dataRows = window.gridDataRows || [];
            const rows = document.querySelectorAll('#dataGridView1 tbody tr');
            const dataGrid = document.getElementById("dataGridView1").rows;

                //   rows.forEach(row => {
                //     if (row.dataset.isNew === 'true') {   // à¤¸à¤¿à¤°à¥à¤« à¤¨à¤ˆ row à¤•à¥‹ reset à¤•à¤°à¥‡à¤‚
                //         for (let c = 2; c < row.cells.length; c++) {
                //             row.cells[c].innerText = '0';
                //         }
                //     }
                //     });

                //         rows.forEach(row => {
                //     for (let c = 2; c < row.cells.length; c++) {
                //         row.cells[c].innerText = '0';
                //     }
                // });
              

            const constructionType = document.getElementById("bag_type").value;
            const sf = document.getElementById("sf").value;
            const searchValue = parseInt(document.getElementById("swlSearch").value) || 0;
            document.getElementById("swl").value = searchValue; 
            const swlValue = searchValue;

            let sizeH = parseFloat(document.getElementById("size_H_box").value) || 0;
            let sizeL = parseFloat(document.getElementById("size_l_box").value) || 0;
            let sizeW = parseFloat(document.getElementById("size_W_box").value) || 0;
            let shortLoop = parseFloat(document.getElementById("short_length_loop_box")?.value) || 0;
            const lType = document.getElementById('l_int_type')?.value || "INT";
            const unit = document.getElementById('h_unit')?.value || "cm";
            const UNValue = document.getElementById('UN_checkbox')?.value || "0";
            const isUN = ['X', 'Y', 'Z'].includes(UNValue);
            const toINCH = val => unit === 'inch' ? val / 2.54 : val;
            shortLoop = toINCH(shortLoop );

                function setRow(rowIndex, gsm, lam, fab, cut) {
                    const rows = document.querySelectorAll('#dataGridView1 tbody tr');
                    if (rows[rowIndex]?.cells.length >= 6) {
                        rows[rowIndex].cells[2].innerText = gsm || '0';
                        rows[rowIndex].cells[3].innerText = lam || '0';
                        rows[rowIndex].cells[4].innerText = fab || '0';
                        rows[rowIndex].cells[5].innerText = cut || '0';
                    }
                }

                function clearRow(rowIndex) {
                    const rows = document.querySelectorAll('#dataGridView1 tbody tr');
                    if (rows[rowIndex]) {
                        for (let c = 2; c <= 6; c++) {
                            rows[rowIndex].cells[c].innerText = '0';
                        }
                    }
                }


                function setLoopValues(width, gram, shortLen, longLen) {
                    // width
                    setCellValue(0, 1, width);

                    // loop grammage
                    document.getElementById("loop_fh").value = gram;
                    setCellValue(14, 1, gram);

                    // loop width
                    setCellValue(14, 3, "30 MM");

                    // loop lengths
                    document.getElementById("short_length_loop").value = shortLen;
                    document.getElementById("long_length_loop").value  = longLen;

                    // chain gram
                    window.chaingram = 0.07;
                }



            const clearRows = rowNames => {
                rowNames.forEach(name => {
                    const idx = dataRows.findIndex(r => r.ROW_SERIES?.toUpperCase() === name);
                    if (idx !== -1) clearRow(idx);
                });
            };

            const setGrid = (r1c2, r3c2, r15c2, r15c4, shortVal, longPercent,r17c2) => {
                    dataGrid[1].cells[2].innerText = r1c2 || '0';
                    dataGrid[3].cells[2].innerText = r3c2 || '0';
                    dataGrid[15].cells[2].innerText = r15c2 || '0';
                    dataGrid[15].cells[4].innerText = r15c4 || '0';
                    dataGrid[7].cells[2].innerText = r17c2 || '0';
                    const slBox = document.getElementById("short_length_loop_box");
                    const llBox = document.getElementById("long_length_loop_box");
                    const sizeH = parseFloat(document.getElementById("size_H_box").value) || 0;

                    if (!slBox.hasAttribute('data-manual')) {
                        slBox.value = (unit === "inch") ? (shortVal / 2.54).toFixed(2) : shortVal || '0';
                    }
                    if (!llBox.hasAttribute('data-manual')) {
                        if (longPercent === 0) {
                           
                            llBox.value = sizeH.toFixed(0);
                            
                        } else if (typeof longPercent === "number") {
                           
                            llBox.value = (sizeH * parseFloat(longPercent) / 100).toFixed(2);
                        } else {
                           
                            
                            
                        llBox.value = (unit === "inch") ? (shortVal / 2.54).toFixed(2) : longPercent || '0';
                    
                        }
                    }

                    // Detect manual editing
                    slBox.addEventListener("focus", function () {
                        this.setAttribute('data-manual', true);
                    });
                    llBox.addEventListener("focus", function () {
                        this.setAttribute('data-manual', true);
                    });

                };

            if (constructionType === "U+2") {

                    const unit = document.getElementById('h_unit')?.value || 'cm'; // Get selected unit

                        // Convert sizes (only once)
                        let convertedSizeL = sizeL;
                        let convertedSizeW = sizeW;
                        let convertedSizeH = sizeH;

                        if (unit === 'inch') {
                            convertedSizeL = sizeL * 2.54;
                            convertedSizeW = sizeW * 2.54;
                            convertedSizeH = sizeH * 2.54;
                        }
                    

                    
                        // Update cell[4] values first (rounded values)
                        rows[0]?.cells[4] && (
                            rows[0].cells[4].innerText = Math.round(
                                isUN ? (convertedSizeL + 17) : (convertedSizeL + 12)
                            )
                        );

                        rows[2]?.cells[4] && (
                            rows[2].cells[4].innerText = Math.round(
                                isUN ? (convertedSizeW + 17) : (convertedSizeW + 12)
                            )
                        );

                        const loopIndex = dataRows.findIndex(r => r.ROW_SERIES?.toUpperCase() === 'LOOP');
                        let body_lam = 0;
                        if (loopIndex !== -1) {
                            body_lam = Number(dataRows[loopIndex].LAMINATION) || 0;
                        }

                        const sideIndex = dataRows.findIndex(r => r.ROW_SERIES?.toUpperCase() === 'SIDE');
                        let datagrid_lam = 0;
                        if (sideIndex !== -1) {
                            datagrid_lam = Number(dataRows[sideIndex].LAMINATION) || 0;
                        }

                        
                        if (convertedSizeH && convertedSizeW) {
                            let aslFormula = (convertedSizeH * 2) + convertedSizeW;
                            let aslAdjustment =  (lType === "EXT" || lType === "INT") ? 19 : 9;
                            let asl = aslFormula + aslAdjustment;

                            let bslFormula = convertedSizeH;
                            let bslAdjustment = (lType === "EXT" || lType === "INT" ? 12 : isUN ? 15 : 9);
                            let bsl = bslFormula + bslAdjustment;

                            // Round ASL and BSL before updating grid
                            rows[0].cells[5].innerText = Math.round(asl);
                            rows[2].cells[5].innerText = Math.round(bsl);
                        }

                    if (isUN) {
                        if (swlValue <= 1000) setGrid(140, 140, 35, "40mm", "40", 70);
                        else if (swlValue <= 1250) setGrid(160, 160, 40, "40mm", "50", 70);
                        else if (swlValue <= 1500) setGrid(180, 180, 50, "40mm", "60", 80);
                        else if (swlValue <= 2000) setGrid(220, 220, 60, "50mm", "90", 100);
                        else if (swlValue <= 2250) setGrid(240, 240, 60, "50mm", "90", 100);
                    } 
                    else {
                        if (sf === "5:1") {
                            if (swlValue <= 600) setGrid(110, 110, 22, "40mm", "30", 60);
                            else if (swlValue <= 800) setGrid(120, 120, 25, "40mm", "35", 60);
                            else if (swlValue <= 1050) setGrid(130, 130, 30, "40mm", "40", 70);
                            else if (swlValue <= 1250) setGrid(150, 150, 35, "40mm", "45", 70); 
                            else if (swlValue <= 1500) setGrid(170, 170, 40, "40mm", "55", 75);
                            else if (swlValue <= 1850) setGrid(190, 190, 50, "50mm", "70", 80);
                            else if (swlValue <= 2000) setGrid(210, 210, 55, "50mm", "80", 100);
                            else if (swlValue <= 2250) setGrid(230, 230, 60, "50mm", "80", 100);
                        }
                        else if (sf === "6:1") {
                            if (swlValue <= 500) setGrid(120, 120, 25, "40mm", "35", 60);
                            else if (swlValue <= 1000) setGrid(150, 150, 35, "40mm", "45", 70);
                            else if (swlValue <= 1250) setGrid(170, 170, 40, "40mm", "55", 75); 
                            else if (swlValue <= 1500) setGrid(210, 210, 50, "50mm", "70", 80);
                            else if (swlValue <= 2000) setGrid(240, 240, 60, "60mm", "80", 100);
                            else if (swlValue <= 2250) setGrid(260, 260, 60, "60mm", "80", 100);
                        }

                    }

                        baffle_all();
                        liner_asia();
                        hemming_liner();
                        fs_with_rope_new();
                        band_calc();
                        handleSkirtOrFS();
                        calculateDSTieOrRope();  
                        processHemm();
                        setupCalculationTriggers();
                        calculateAllWeights();
                        loop_cover_form();
                        thread_for_all();
                        box_to_grid();
                        dust_proofing_particular();
                        dust_proofing_component_wise();
                     
                        fs_ds_skirt_fabric_size();
                     
                
            }
            else if (constructionType === "U+2 CC") {

                    if (sf === "5:1") {
                        if (swlValue <= 500) setGrid(143,143, 30, "70mm", "30","30");
                        else if (swlValue <= 1000) setGrid(154, 154, 35, "70mm", "35", "35");
                        else if (swlValue <= 1250) setGrid(176, 176, 40, "70mm", "40", "40");
                        else if (swlValue <= 1500) setGrid(198, 198, 45, "70mm", "45", "45");
                        else if (swlValue <= 1800) setGrid(220, 220, 50, "80mm", "50", "50");
                        else if (swlValue <= 2000) setGrid(264, 264, 60, "80mm", "50", "50");
                        else if (swlValue <= 2250) setGrid(242, 230, 60, "80mm", "50", "50");
                    } else if (sf === "6:1") {
                        if (swlValue <= 500) setGrid(154, 154, 35, "70mm", "35", "35");
                        else if (swlValue <= 1000) setGrid(176, 176, 40, "70mm", "40", "40");
                        else if (swlValue <= 1250) setGrid(198, 198, 45, "70mm", "45", "45");
                        else if (swlValue <= 1500) setGrid(220, 220, 60, "80mm", "50", "50");
                        else if (swlValue <= 2000) setGrid(264, 264, 65, "80mm", "50", "50");
                        else if (swlValue <= 2250) setGrid(260, 260, 70, "60mm", "50", "50");
                    }
                    const unit = document.getElementById('h_unit')?.value || 'cm'; 
                    let convertedSizeL = sizeL;
                    let convertedSizeW = sizeW;
                    let convertedSizeH = sizeH;

                    if (unit === 'inch') {
                        convertedSizeL = sizeL * 2.54;
                        convertedSizeW = sizeW * 2.54;
                        convertedSizeH = sizeH * 2.54;
                    }
                    

                    rows[0]?.cells[4] && (
                        rows[0].cells[4].innerText = Math.round(
                            isUN ? (convertedSizeL + 17) : (convertedSizeL + 12)
                        )
                    );

                    rows[2]?.cells[4] && (
                        rows[2].cells[4].innerText = Math.round(
                            isUN ? (convertedSizeW + 17) : (convertedSizeW + 12)
                        )
                    );

                    const loopIndex = dataRows.findIndex(r => r.ROW_SERIES?.toUpperCase() === 'LOOP');
                    let body_lam = 0;
                    if (loopIndex !== -1) {
                        body_lam = Number(dataRows[loopIndex].LAMINATION) || 0;
                    }

                    const sideIndex = dataRows.findIndex(r => r.ROW_SERIES?.toUpperCase() === 'SIDE');
                    let datagrid_lam = 0;
                    if (sideIndex !== -1) {
                        datagrid_lam = Number(dataRows[sideIndex].LAMINATION) || 0;
                    }

                    if (convertedSizeH && convertedSizeW) {
                        let asl, bsl;

                        if (body_lam > 0 || datagrid_lam > 0) {
                            asl = (convertedSizeH * 2) + convertedSizeW + 12;
                            bsl = convertedSizeH + 9;
                        } else {
                            asl = (convertedSizeH * 2) + convertedSizeW + 19;
                            bsl = convertedSizeH + 12;
                        }

                        if (isUN) {
                            asl = (convertedSizeH * 2) + convertedSizeW + 19;
                            bsl = convertedSizeH + 15;
                        }

                        rows[0].cells[5].innerText = Math.round(asl);
                        rows[2].cells[5].innerText = Math.round(bsl);
                    }
                    baffle_all();
            liner_asia();
            hemming_liner();
            fs_with_rope_new();
            band_calc();
            handleSkirtOrFS();
                calculateDSTieOrRope();  
                processHemm() ;
                setupCalculationTriggers();
            calculateAllWeights();
                loop_cover_form();
                 thread_for_all();
                        box_to_grid();
                         dust_proofing_particular();
                        fs_ds_skirt_fabric_size();

                    
            }
            else if (constructionType === "4 PNL BFL CC") {
                if (sf === "5:1") {
                    if (swlValue >= 0 && swlValue <= 500) setGrid(121, 121, 20, "70mm", "25", "25",120);
                    else if (swlValue <= 750) setGrid(132 , 132 , 35, "70mm", "30", "30",140);
                    else if (swlValue <= 1000) setGrid(154, 154, 35, "70mm", "35", "35" ,160);
                    else if (swlValue <= 1250) setGrid(176, 176, 40, "70mm", "40", "40" ,180);
                    else if (swlValue <= 1500) setGrid(198, 198, 45, "70mm", "45", "45" ,200);
                    else if (swlValue <= 1800) setGrid(220, 220, 50, "80mm", "50", "50" ,220);
                    else if (swlValue <= 2000) setGrid(240, 240, 60, "80mm", "50", "50" ,240);
                    else if (swlValue <= 2250) setGrid(264, 270, 70, "80mm", "60", "60" ,264);
                } else if (sf === "6:1") {
                    if (swlValue >= 0 && swlValue <= 500) setGrid(154, 154, 35, "70mm", "35", "35" ,160);
                    else if (swlValue <= 1000) setGrid(176, 176, 40, "70mm", "40", "40" ,180);
                    else if (swlValue <= 1250) setGrid(198, 198, 45, "70mm", "45", "45" ,200);
                    else if (swlValue <= 1500) setGrid(220, 220, 60, "80mm", "50", "50",220);
                    else if (swlValue <= 2000) setGrid(264, 264, 65, "80mm", "50", "50",270);
                    else if (swlValue <= 2250) setGrid(290, 290, 80, "80mm", "60", "60",290);
                }

                const unit = document.getElementById('h_unit')?.value || 'cm'; // Get selected unit

                    // Convert sizes (only once)
                    let convertedSizeL = sizeL;
                    let convertedSizeW = sizeW;
                    let convertedSizeH = sizeH;

                    if (unit === 'inch') {
                        convertedSizeL = sizeL * 2.54;
                        convertedSizeW = sizeW * 2.54;
                        convertedSizeH = sizeH * 2.54;
                    }
                    

                    rows[0]?.cells[4] && (
                        rows[0].cells[4].innerText = isUN ? Math.round(convertedSizeL + 17) : Math.round(convertedSizeL + 12)
                    );
                    rows[6]?.cells[4] && (
                        rows[6].cells[4].innerText= Math.round(convertedSizeL + 11));
                        

                    rows[2]?.cells[4] && (
                        rows[2].cells[4].innerText = Math.round(
                            isUN ? (convertedSizeW + 17) : (convertedSizeW + 12)
                        )
                    );
                    rows[6]?.cells[5] && (
                        rows[6].cells[5].innerText= Math.round(convertedSizeW + 11));


                    // Now calculate ASL and BSL
                    if (convertedSizeH && convertedSizeW) {
                        let aslFormula = convertedSizeH + 12;
                        let aslAdjustment = isUN ? Math.round(convertedSizeH + 3) : 0;
                        let asl = aslFormula + aslAdjustment;

                        let bslFormula = convertedSizeH + 12;
                        let bslAdjustment = isUN ? Math.round(convertedSizeH + 3) : 0;
                        let bsl = bslFormula + bslAdjustment;

                        // Round ASL and BSL before updating grid
                        rows[0].cells[5].innerText = Math.round(asl);
                        rows[2].cells[5].innerText = Math.round(bsl);
                    }
                        if (lType === "INT") {
                            rows[6].cells[4].innerText = Math.round(convertedSizeL + 11);
                            rows[6].cells[5].innerText = Math.round(convertedSizeW + 11);
                        }


                    
                baffle_all();
            liner_asia();
            hemming_liner();
            fs_with_rope_new();
            band_calc();
            handleSkirtOrFS();
            calculateDSTieOrRope();   
            processHemm();   
                setupCalculationTriggers();
            calculateAllWeights();
                loop_cover_form();
                 thread_for_all();
                        box_to_grid();
                         dust_proofing_particular();
                        fs_ds_skirt_fabric_size();
            
            
            

            }
            else if (constructionType === "4 PNL CC") {
                if (sf === "5:1") {
                    if (swlValue >= 0 && swlValue <= 500) setGrid(143, 143, 30, "70mm", "30", "30", 150);
                    else if (swlValue <= 1000) setGrid(154, 154, 35, "70mm", "35", "35", 160);
                    else if (swlValue <= 1250) setGrid(176, 176, 40, "70mm", "40", "40", 180);
                    else if (swlValue <= 1500) setGrid(198, 198, 45, "70mm", "45", "45", 200);
                    else if (swlValue <= 1750) setGrid(220, 220, 50, "80mm", "50", "50", 220);
                    else if (swlValue <= 2000) setGrid(242, 242, 60, "80mm", "50", "50", 240);
                    else if (swlValue <= 2250) setGrid(264, 264, 70, "80mm", "60", "60", 270);
                } else if (sf === "6:1") {
                    if (swlValue >= 0 && swlValue <= 500) setGrid(154, 154, 35, "70mm", "35", "35", 160);
                    else if (swlValue <= 1000) setGrid(176, 176, 40, "70mm", "40", "40", 180);
                    else if (swlValue <= 1250) setGrid(198, 198, 45, "70mm", "45", "45", 200);
                    else if (swlValue <= 1500) setGrid(220, 220, 60, "80mm", "50", "50", 220);
                    else if (swlValue <= 2000) setGrid(264, 264, 65, "80mm", "50", "50", 270);
                    else if (swlValue <= 2250) setGrid(290, 290, 80, "80mm", "60", "60", 290);
                }
                const unit = document.getElementById('h_unit')?.value || 'cm'; // Get selected unit

                    // Convert sizes (only once)
                    let convertedSizeL = sizeL;
                    let convertedSizeW = sizeW;
                    let convertedSizeH = sizeH;

                    if (unit === 'inch') {
                        convertedSizeL = sizeL * 2.54;
                        convertedSizeW = sizeW * 2.54;
                        convertedSizeH = sizeH * 2.54;
                    }
                    

                            rows[0]?.cells[4] && (
                            rows[0].cells[4].innerText = isUN ? Math.round(convertedSizeL + 17) : Math.round(convertedSizeL + 12)
                        );

                        rows[6]?.cells[4] && (
                            rows[6].cells[4].innerText = Math.round(convertedSizeL + 11)
                        );

                        rows[2]?.cells[4] && (
                            rows[2].cells[4].innerText = isUN ? Math.round(convertedSizeW + 17) : Math.round(convertedSizeW + 12)
                        );

                        rows[6]?.cells[5] && (
                            rows[6].cells[5].innerText = Math.round(convertedSizeW + 11)
                        );


                    // Now calculate ASL and BSL
                    if (convertedSizeH && convertedSizeW) {
                        let aslFormula = convertedSizeH + 12;
                        let aslAdjustment =  isUN ? Math.round(convertedSizeH + 3) : 0;
                        let asl = aslFormula + aslAdjustment;

                        let bslFormula = convertedSizeH + 12;
                        let bslAdjustment = isUN ? Math.round(convertedSizeH + 3) : 0;
                        let bsl = bslFormula + bslAdjustment;

                        // Round ASL and BSL before updating grid
                        rows[0].cells[5].innerText = Math.round(asl);
                        rows[2].cells[5].innerText = Math.round(bsl);
                    }
                        if (lType === "EXT") {
                            let currentValue = parseFloat(rows[0].cells[4].innerText) || 0;
                            rows[0].cells[4].innerText = Math.round(currentValue + 3);


                            
                        }


                    
            baffle_all();
            liner_asia();
            hemming_liner();
            fs_with_rope_new();
            band_calc();
            handleSkirtOrFS();
            calculateDSTieOrRope();   
            processHemm();
                setupCalculationTriggers();
            calculateAllWeights();
                loop_cover_form();
                 thread_for_all();
                        box_to_grid();
                         dust_proofing_particular();
                        fs_ds_skirt_fabric_size();
                
            
            
            
                        
            }
            else if (constructionType === "U+2 CC BAFFLE") {
                if (sf === "5:1") {
                    if (swlValue >= 0 && swlValue <= 500) setGrid(143,143, 30, "70mm", "30","30");
                    else if (swlValue <= 1000) setGrid(154, 154, 35, "70mm", "35", "35");
                    else if (swlValue <= 1250) setGrid(176, 176, 40, "70mm", "40", "40");
                    else if (swlValue <= 1500) setGrid(198, 198,45, "70mm", "45",  "45");
                    else if (swlValue <= 1800) setGrid(220,220, 50, "80mm", "50",  "50");
                    else if (swlValue <= 2000) setGrid(242, 242,60, "80mm", "50",  "50");
                    else if (swlValue <= 2250) setGrid(264,264, 60, "80mm", "50",  "50");
                } else if (sf === "6:1") {
                    if (swlValue >= 0 && swlValue <= 500) setGrid(154,154, 35, "70mm", "35", "35");
                    else if (swlValue <= 1000) setGrid(176, 176,40, "70mm", "40", "40");
                    else if (swlValue <= 1250) setGrid(198, 198,45, "70mm", "45",  "45");
                    else if (swlValue <= 1500) setGrid(220,220, 60, "80mm", "50", "50");
                    else if (swlValue <= 2000) setGrid(264, 264,65, "80mm", "50",  "50");
                    else if (swlValue <= 2250) setGrid(286, 286,70, "80mm", "50",  "50");
                }
                const unit = document.getElementById('h_unit')?.value || 'cm'; // Get selected unit

                    // Convert sizes (only once)
                    let convertedSizeL = sizeL;
                    let convertedSizeW = sizeW;
                    let convertedSizeH = sizeH;

                    if (unit === 'inch') {
                        convertedSizeL = sizeL * 2.54;
                        convertedSizeW = sizeW * 2.54;
                        convertedSizeH = sizeH * 2.54;
                    }
                    

                    rows[0]?.cells[4] && (
                        rows[0].cells[4].innerText = Math.round(
                            isUN ? (convertedSizeL + 17) : (convertedSizeL + 12)
                        )
                    );

                    rows[2]?.cells[4] && (
                        rows[2].cells[4].innerText = Math.round(
                            isUN ? (convertedSizeW + 17) : (convertedSizeW + 12)
                        )
                    );

                    const loopIndex = dataRows.findIndex(r => r.ROW_SERIES?.toUpperCase() === 'LOOP');
                    let body_lam = loopIndex !== -1 ? Number(dataRows[loopIndex].LAMINATION) || 0 : 0;

                    const sideIndex = dataRows.findIndex(r => r.ROW_SERIES?.toUpperCase() === 'SIDE');
                    let datagrid_lam = sideIndex !== -1 ? Number(dataRows[sideIndex].LAMINATION) || 0 : 0;

                        if (convertedSizeH && convertedSizeW) {
                            let asl, bsl;

                            // Case 1: Lamination applied
                            if (body_lam > 0) {
                                asl = (convertedSizeH * 2) + convertedSizeW + 12;
                                bsl = convertedSizeH + 9;
                            } 
                            else { // Case 2: No lamination
                                asl = (convertedSizeH * 2) + convertedSizeW + 19;
                                bsl = convertedSizeH + 12;
                            }

                            // Case 3: UN condition overrides
                            if (isUN) {
                                asl = (convertedSizeH * 2) + convertedSizeW + 19;
                                bsl = convertedSizeH + 15;
                            }

                            // Case 4: EXT adjustment
                            if (lType === "EXT") {
                                asl += 3;
                            }

                            // âœ… Assign values to table
                            rows[0].cells[5].innerText = Math.round(asl);
                            rows[2].cells[5].innerText = Math.round(bsl);
                        }





                    // if (convertedSizeH && convertedSizeW) {
                    //     let isUN = true; 
                    //     let bodyLam = parseFloat(cells[3].textContent.trim()) || 0;
                    //     let isLaminated = bodyLam > 0;
                        
                    //     let aslFormula = (convertedSizeH * 2) + convertedSizeW;
                    //     let aslAdjustment = isUN ? 15 : (isLaminated ? 12 : 19);
                    //     let asl = aslFormula + aslAdjustment;

                    //     let bslFormula = convertedSizeH;
                    //     let bslAdjustment = isUN ? 9 : (isLaminated ? 9 : 12);
                    //     let bsl = bslFormula + bslAdjustment;
                        
                        

                    //     if (lType === "EXT") {
                    //         asl += 3;
                    //     }

                    //     rows[0].cells[5].innerText = Math.round(asl); // ASL
                    //     rows[2].cells[5].innerText = Math.round(bsl); // BSL
                    // } 

                        

                        baffle_all();
            liner_asia();
            hemming_liner();
            fs_with_rope_new();
            band_calc();
            handleSkirtOrFS();
            calculateDSTieOrRope();   
            processHemm(); 
                setupCalculationTriggers();
            calculateAllWeights();
                loop_cover_form();
                 thread_for_all();
                        box_to_grid();
                         dust_proofing_particular();
                        fs_ds_skirt_fabric_size();
                
                    

            }
            else if (constructionType === "CIRCULAR CC BFL"){ 
                if (sf === "5:1") {
                    if (swlValue >= 0 && swlValue <= 600) setGrid(121, "0", 30, "70mm", "30", "30" ,120);
                        else if (swlValue <= 800) setGrid(132, "0", 35, "70mm", "35",  "35" ,140);
                        else if (swlValue <= 1000) setGrid(154, "0", 35, "70mm", "35",  "35" ,160);
                        else if (swlValue <= 1250) setGrid(176, "0", 40, "70mm", "40",  "40" ,180);
                        else if (swlValue <= 1500) setGrid(198, "0", 45, "70mm", "45",  "45",200);
                        else if (swlValue <= 1800) setGrid(220, "0", 50, "80mm", "50", "50", 220);
                        else if (swlValue <= 2000) setGrid(242, "0", 60, "80mm", "50", "50", 240);
                        else if (swlValue <= 2250) setGrid(264, "0", 70, "80mm", "60", "60",270);
                } else if (sf === "6:1") {
                    if (swlValue >= 0 && swlValue <= 500) setGrid(154,"0", 35, "70mm", "35", "35",160);
                    else if (swlValue <= 1000) setGrid(176, "0", 40, "70mm", "40",  "40" ,180);
                    else if (swlValue <= 1250) setGrid(198, "0", 45, "70mm", "45",  "45" ,200);
                    else if (swlValue <= 1500) setGrid(220, "0", 60, "80mm", "50",  "50" ,220);
                    else if (swlValue <= 2000) setGrid(264, "0", 65, "80mm", "50",  "50" ,270);
                    else if (swlValue <= 2250) setGrid(290, "0", 80, "80mm", "60",  "60" ,290);
                } 

                    const unit = document.getElementById('h_unit')?.value || 'cm'; // Get selected unit

                    // Convert sizes (only once)
                    let convertedSizeL = sizeL;
                    let convertedSizeW = sizeW;
                    let convertedSizeH = sizeH;

                    if (unit === 'inch') {
                        convertedSizeL = sizeL * 2.54;
                        convertedSizeW = sizeW * 2.54;
                        convertedSizeH = sizeH * 2.54;
                    }
                    

                    rows[0]?.cells[4] && (
                        rows[0].cells[4].innerText = Math.round(convertedSizeL + convertedSizeW)
                        
                    );

                    rows[6]?.cells[4] && (
                        rows[6].cells[4].innerText = Math.round(
                                (convertedSizeL + 10)
                        )
                    );

                    // rows[2]?.cells[4] && (
                    //     rows[2].cells[4].innerText = Math.round(convertedSizeL + convertedSizeW)
                        
                    // );

                    rows[6]?.cells[5] && (
                        rows[6].cells[5].innerText = Math.round(
                                (convertedSizeW + 10)
                        )
                    );

                    if (convertedSizeH && convertedSizeW) {
                        let aslFormula = convertedSizeH;
                        let aslAdjustment = (lType === "EXT" || lType === "INT") ? 12 : (isUN ? 15 : 9);
                        let asl = aslFormula + aslAdjustment;

                        rows[0].cells[5].innerText = Math.round(asl);
                    }

                        
                    
                        baffle_all();
            liner_asia();
            hemming_liner();
            fs_with_rope_new();
            band_calc();
            handleSkirtOrFS();
            calculateDSTieOrRope();   
            processHemm(); 
                setupCalculationTriggers();
            calculateAllWeights();
                loop_cover_form();
                 thread_for_all();
                        box_to_grid();
                         dust_proofing_particular();
                        fs_ds_skirt_fabric_size();
                
            
            
            
                        


            }
            else if (constructionType === "4 PNL BFL CNR"){
                if (sf === "5:1") {
                    if (swlValue >= 0 && swlValue <= 600) setGrid(130, 130, 22, "40mm", "30", 60,130);
                        else if (swlValue <= 800) setGrid(140, 140, 25, "40mm", "35",  60 ,140);
                        else if (swlValue <= 1000) setGrid(150, 150, 30, "40mm", "40",  70 ,150);
                        else if (swlValue <= 1250) setGrid(160, 160, 35, "40mm", "45", 70 ,160);
                        else if (swlValue <= 1500) setGrid(170, 170, 40, "40mm", "55",  75,170);
                        else if (swlValue <= 1850) setGrid(190, 190, 50, "50mm", "70",80, 190);
                        else if (swlValue <= 2000) setGrid(220, 220, 55, "50mm", "80", 0, 220);
                        else if (swlValue <= 2250) setGrid(240, 240, 60, "50mm", "80", 0,240);
                } else if (sf === "6:1") {
                    if (swlValue >= 0 && swlValue <= 500) setGrid(140, 140, 25, "40mm", "35",  60,140);
                    else if (swlValue <= 1000) setGrid(150, 150, 35, "40mm", "45", 70 ,150);
                    else if (swlValue <= 1250) setGrid(170, 170, 40, "50mm", "55", 75 ,170);
                    else if (swlValue <= 1500) setGrid(220, 220, 50, "50mm", "70",  80 ,220);
                    else if (swlValue <= 2000) setGrid(240, 240, 60, "60mm", "80", 0 ,240);
                    else if (swlValue <= 2250) setGrid(260, 260, 60, "60mm", "80", 0,260);
                }
                const unit = document.getElementById('h_unit')?.value || 'cm'; // Get selected unit

                    // Convert sizes (only once)
                    let convertedSizeL = sizeL;
                    let convertedSizeW = sizeW;
                    let convertedSizeH = sizeH;

                    if (unit === 'inch') {
                        convertedSizeL = sizeL * 2.54;
                        convertedSizeW = sizeW * 2.54;
                        convertedSizeH = sizeH * 2.54;
                    }
                    

                    rows[0]?.cells[4] && (
                        rows[0].cells[4].innerText = isUN ? Math.round(convertedSizeL + 17) : Math.round(convertedSizeL + 12)
                    );
                    rows[6]?.cells[4] && (
                        rows[6].cells[4].innerText= Math.round(convertedSizeL + 11));
                        

                    rows[2]?.cells[4] && (
                        rows[2].cells[4].innerText = Math.round(
                            isUN ? (convertedSizeW + 17) : (convertedSizeW + 12)
                        )
                    );
                    rows[6]?.cells[5] && (
                        rows[6].cells[5].innerText= Math.round(convertedSizeW + 11));

                    
                    const loopIndex = dataRows.findIndex(r => r.ROW_SERIES?.toUpperCase() === 'LOOP');
                    let body_lam = 0;
                    if (loopIndex !== -1) {
                        body_lam = Number(dataRows[loopIndex].LAMINATION) || 0;
                    }

                    const sideIndex = dataRows.findIndex(r => r.ROW_SERIES?.toUpperCase() === 'SIDE');
                    let datagrid_lam = 0;
                    if (sideIndex !== -1) {
                        datagrid_lam = Number(dataRows[sideIndex].LAMINATION) || 0;
                    }


                    // Now calculate ASL and BSL
                    if (convertedSizeH && convertedSizeW) {
                        let aslFormula = convertedSizeH + 12;
                        let aslAdjustment = isUN ? Math.round(convertedSizeH + 3) : 0;
                        let asl = aslFormula + aslAdjustment;

                        let bslFormula = convertedSizeH + 12;
                        let bslAdjustment = isUN ? Math.round(convertedSizeH + 3) : 0;
                        let bsl = bslFormula + bslAdjustment;

                        // Round ASL and BSL before updating grid
                        rows[0].cells[5].innerText = Math.round(asl);
                        rows[2].cells[5].innerText = Math.round(bsl);
                    }
                        if (lType === "INT") {
                            rows[6].cells[4].innerText = Math.round(convertedSizeL + 11);
                            rows[6].cells[5].innerText = Math.round(convertedSizeW + 11);
                        }


                        

                        
                        baffle_all();
            liner_asia();
            hemming_liner();
            fs_with_rope_new();
            band_calc();
            handleSkirtOrFS();
            calculateDSTieOrRope();   
            processHemm();   
                setupCalculationTriggers();
            calculateAllWeights();
                loop_cover_form();
                 thread_for_all();
                        box_to_grid();
                         dust_proofing_particular();
                        fs_ds_skirt_fabric_size();
            
            
            
            
            }
            else if (constructionType === "4 PNL CNR"){
                if (sf === "5:1") {
                    if (swlValue >= 0 && swlValue <= 600) setGrid(110, 110, 22, "40mm", "30", 60,110);
                        else if (swlValue <= 800) setGrid(120, 120, 25, "40mm", "35",  60 ,120);
                        else if (swlValue <= 1000) setGrid(130, 130, 30, "40mm", "40",  70 ,130);
                        else if (swlValue <= 1250) setGrid(150, 150, 35, "40mm", "45", 70 ,150);
                        else if (swlValue <= 1500) setGrid(170, 170, 40, "40mm", "55", 75,170);
                        else if (swlValue <= 1800) setGrid(190, 190, 50, "50mm", "70",80, 190);
                        else if (swlValue <= 2000) setGrid(210, 210, 55, "50mm", "80",0, 210);
                        else if (swlValue <= 2250) setGrid(230, 230, 60, "50mm", "80", 0,230);
                } else if (sf === "6:1") {
                    if (swlValue >= 0 && swlValue <= 500) setGrid(120, 120, 25, "40mm", "35",  60 ,120);
                    else if (swlValue <= 1000) setGrid(150, 150, 35, "40mm", "45", 70 ,150);
                    else if (swlValue <= 1250) setGrid(170, 170, 40, "40mm", "55",  75,170);
                    else if (swlValue <= 1500) setGrid(210, 210, 50, "50mm", "70",80, 210);
                    else if (swlValue <= 2000) setGrid(240, 240, 60, "60mm", "80", 0, 240);
                    else if (swlValue <= 2250) setGrid(260, 260, 6, "60mm", "80", 0, 260);
                }

                const unit = document.getElementById('h_unit')?.value || 'cm'; // Get selected unit

                    // Convert sizes (only once)
                    let convertedSizeL = sizeL;
                    let convertedSizeW = sizeW;
                    let convertedSizeH = sizeH;

                    if (unit === 'inch') {
                        convertedSizeL = sizeL * 2.54;
                        convertedSizeW = sizeW * 2.54;
                        convertedSizeH = sizeH * 2.54;
                    }
                    

                            rows[0]?.cells[4] && (
                            rows[0].cells[4].innerText = isUN ? Math.round(convertedSizeL + 17) : Math.round(convertedSizeL + 12)
                        );

                        rows[6]?.cells[4] && (
                            rows[6].cells[4].innerText = Math.round(
                                convertedSizeL + ((lType === "EXT" || lType === "INT") ? 12 : 11)
                            )
                        );

                        //  rows[6]?.cells[4] && (
                        //     rows[6].cells[4].innerText = Math.round(
                        //         convertedSizeL +  12)
                            
                        // );


                        rows[2]?.cells[4] && (
                            rows[2].cells[4].innerText = isUN ? Math.round(convertedSizeW + 17) : Math.round(convertedSizeW + 12)
                        );

                            rows[6]?.cells[5] && (
                            rows[6].cells[5].innerText = Math.round(
                                convertedSizeL +  11)
                            
                        );

                        const loopIndex = dataRows.findIndex(r => r.ROW_SERIES?.toUpperCase() === 'LOOP');
                        let body_lam = 0;
                        if (loopIndex !== -1) {
                            body_lam = Number(dataRows[loopIndex].LAMINATION) || 0;
                        }

                        const sideIndex = dataRows.findIndex(r => r.ROW_SERIES?.toUpperCase() === 'SIDE');
                        let datagrid_lam = 0;
                        if (sideIndex !== -1) {
                            datagrid_lam = Number(dataRows[sideIndex].LAMINATION) || 0;
                        }

                    // Now calculate ASL and BSL
                    if (convertedSizeH && convertedSizeW) {
                        let aslFormula = convertedSizeH + 12;
                        let aslAdjustment =  isUN ? Math.round(convertedSizeH + 3) : 0;
                        let asl = aslFormula + aslAdjustment;

                        let bslFormula = convertedSizeH + 12;
                        let bslAdjustment = isUN ? Math.round(convertedSizeH + 3) : 0;
                        let bsl = bslFormula + bslAdjustment;

                        // Round ASL and BSL before updating grid
                        rows[0].cells[5].innerText = Math.round(asl);
                        rows[2].cells[5].innerText = Math.round(bsl);
                    }
                        const table = document.querySelector('#dataGridView1 tbody');

                    
                        
                        baffle_all();
            liner_asia();
            hemming_liner();
            fs_with_rope_new();
            band_calc();
            handleSkirtOrFS();
                calculateDSTieOrRope();   
                processHemm() ;
                setupCalculationTriggers();
            calculateAllWeights();
                loop_cover_form();
                 thread_for_all();
                        box_to_grid();
                         dust_proofing_particular();
                        fs_ds_skirt_fabric_size();
            
            
            }
            else if (constructionType === "U+2 BAFFLE") {
                    if (sf === "5:1") {
                        if (swlValue <= 600) setGrid(130,130,22, "40mm", "30",60);
                        else if (swlValue <= 800) setGrid(140, 140, 25, "40mm", "35", 60);
                        else if (swlValue <= 1050) setGrid(150, 150, 30, "40mm", "40", 70);
                        else if (swlValue <= 1250) setGrid(160, 160, 35, "40mm", "45", 70);
                        else if (swlValue <= 1500) setGrid(170, 170, 40, "40mm", "55", 75);
                        else if (swlValue <= 1850) setGrid(190, 190, 50, "50mm", "70", 80);
                        else if (swlValue <= 2000) setGrid(220, 220, 55, "50mm", "80", 0);
                            else if (swlValue <= 2250) setGrid(240, 240, 60, "50mm", "80", 0);
                    } else if (sf === "6:1") {
                        if (swlValue <= 500) setGrid(140, 140, 23, "40mm", "35", 60);
                        else if (swlValue <= 1000) setGrid(150, 150, 35, "40mm", "45", 70);
                        else if (swlValue <= 1250) setGrid(170, 170, 40, "50mm", "55", 75);
                        else if (swlValue <= 1500) setGrid(220, 220, 50, "50mm", "70", 80);
                        else if (swlValue <= 2000) setGrid(240, 240, 60, "60mm", "80", 0);
                        else if (swlValue <= 2250) setGrid(260, 260, 60, "60mm", "80", 0);
                    }
                        const unit = document.getElementById('h_unit')?.value || 'cm'; 

                    // Convert sizes (only once)
                    let convertedSizeL = sizeL;
                    let convertedSizeW = sizeW;
                    let convertedSizeH = sizeH;

                    if (unit === 'inch') {
                        convertedSizeL = sizeL * 2.54;
                        convertedSizeW = sizeW * 2.54;
                        convertedSizeH = sizeH * 2.54;
                    }
                    

                    rows[0]?.cells[4] && (
                        rows[0].cells[4].innerText = Math.round(
                            isUN ? (convertedSizeL + 17) : (convertedSizeL + 12)
                        )
                    );

                    rows[2]?.cells[4] && (
                        rows[2].cells[4].innerText = Math.round(
                            isUN ? (convertedSizeW + 17) : (convertedSizeW + 12)
                        )
                    );

                    const loopIndex = dataRows.findIndex(r => r.ROW_SERIES?.toUpperCase() === 'LOOP');
                    let body_lam = 0;
                    if (loopIndex !== -1) {
                        body_lam = Number(dataRows[loopIndex].LAMINATION) || 0;
                    }

                    const sideIndex = dataRows.findIndex(r => r.ROW_SERIES?.toUpperCase() === 'SIDE');
                    let datagrid_lam = 0;
                    if (sideIndex !== -1) {
                        datagrid_lam = Number(dataRows[sideIndex].LAMINATION) || 0;
                    }

                    // Now calculate ASL and BSL
                    if (convertedSizeH && convertedSizeW) {
                        let aslFormula = (convertedSizeH * 2) + convertedSizeW;
                        let aslAdjustment =  (lType === "EXT" || lType === "INT") ? 19 : 9;
                        let asl = aslFormula + aslAdjustment;

                        let bslFormula = convertedSizeH;
                        let bslAdjustment = (lType === "EXT" || lType === "INT" ? 12 : isUN ? 15 : 9);
                        let bsl = bslFormula + bslAdjustment;

                        // Round ASL and BSL before updating grid
                        rows[0].cells[5].innerText = Math.round(asl);
                        rows[2].cells[5].innerText = Math.round(bsl);
                    }
                        if (lType === "EXT") {
                            let currentValue = parseFloat(rows[0].cells[5].innerText) || 0;
                            rows[0].cells[5].innerText = Math.round(currentValue + 3)
                        }


                    baffle_all();
            liner_asia();
            hemming_liner();
            fs_with_rope_new();
            band_calc();
            handleSkirtOrFS();
            calculateDSTieOrRope();   
            processHemm() ;
            setupCalculationTriggers();
            calculateAllWeights();
            loop_cover_form();
             thread_for_all();
                        box_to_grid();
                         dust_proofing_particular();
                        fs_ds_skirt_fabric_size();
                    
                    
                            
                
            }
            else if (constructionType === "CIRCULAR CC"){ 
                if (sf === "5:1") {
                if (swlValue >= 0 && swlValue <= 600) setGrid(121, "0", 30, "70mm", "30", "30",120);
                    else if (swlValue <= 800) setGrid(132, "0", 35, "70mm", "35", "35" ,140);
                    else if (swlValue <= 1000) setGrid(154, "0", 35, "70mm", "35", "35" ,160);
                    else if (swlValue <= 1250) setGrid(176, "0", 40, "70mm", "40", "40" ,180);
                    else if (swlValue <= 1500) setGrid(198, "0", 45, "70mm", "45", "45",200);
                    else if (swlValue <= 1800) setGrid(220, "0", 50, "80mm", "50", "50", 220);
                    else if (swlValue <= 2000) setGrid(242, "0", 60, "80mm", "50", "50", 240);
                    else if (swlValue <= 2250) setGrid(264, "0", 60, "80mm", "60","50",270);
                } else if (sf === "6:1") {
                    if (swlValue >= 0 && swlValue <= 500) setGrid(154, "0", 35, "70mm", "35","35",160);
                    else if (swlValue <= 1000) setGrid(176, "0", 40, "70mm", "40", "40" ,180);
                    else if (swlValue <= 1250) setGrid(198, "0", 45, "70mm", "45",  "45" ,200);
                    else if (swlValue <= 1500) setGrid(220,"0", 60, "80mm", "50",  "50" ,220);
                    else if (swlValue <= 2000) setGrid(264, "0", 65, "80mm", "50",  "50" ,270);
                    else if (swlValue <= 2250) setGrid(286, "0", 70, "80mm", "50",  "50",290);
                } 
                const unit = document.getElementById('h_unit')?.value || 'cm'; 

                    let convertedSizeL = sizeL;
                    let convertedSizeW = sizeW;
                    let convertedSizeH = sizeH;

                    if (unit === 'inch') {
                        convertedSizeL = sizeL * 2.54;
                        convertedSizeW = sizeW * 2.54;
                        convertedSizeH = sizeH * 2.54;
                    }
                    

                    rows[0]?.cells[4] && (
                        rows[0].cells[4].innerText = Math.round(convertedSizeL + convertedSizeW)
                        
                    );

                    rows[6]?.cells[4] && (
                        rows[6].cells[4].innerText = Math.round(
                                (convertedSizeL + 10)
                        )
                    );

                  if (rows[2] && rows[2].cells[4]) {
                        rows[2].cells[4].innerText = 0;
                    }

                     if (rows[2] && rows[2].cells[5]) {
                        rows[2].cells[5].innerText = 0;
                    }
                    
                    rows[6]?.cells[5] && (
                        rows[6].cells[5].innerText = Math.round(
                                (convertedSizeW + 10)
                        )
                    );

                    if (convertedSizeH && convertedSizeW) {
                        let aslFormula = convertedSizeH;
                        let aslAdjustment = (lType === "EXT" || lType === "INT") ? 12 : (isUN ? 15 : 9);
                        let asl = aslFormula + aslAdjustment;
                        rows[0].cells[5].innerText = Math.round(asl);
                    }
                    baffle_all();
            liner_asia();
            hemming_liner();
            fs_with_rope_new();
            band_calc();
            handleSkirtOrFS();
                calculateDSTieOrRope();  
                processHemm() ;
                setupCalculationTriggers();
            calculateAllWeights();
                loop_cover_form();   
                thread_for_all();
                        box_to_grid();
                         dust_proofing_particular();
                        fs_ds_skirt_fabric_size();
        

            }
            else if (constructionType === "SINGLE LOOP"){ 

                rows[19]?.cells[2] && (rows[19].cells[2].innerText = 90);
                rows[19]?.cells[3] && (rows[19].cells[3].innerText = 20);
                rows[19]?.cells[4] && (rows[19].cells[4].innerText = 30);
                rows[19]?.cells[5] && (rows[19].cells[5].innerText = 35);
                rows[15]?.cells[5] && (rows[15].cells[5].innerText = 0);

                document.getElementById("loop_x").value = "0";
                document.getElementById("loop_fh").value = "0";
                document.getElementById("body_loop1").value = "1";

                if (sf === "5:1") {
                    if (swlValue >= 0 && swlValue <= 500) setGrid(90, 90, '', "", "", '',120);
                        else if (swlValue <= 1000) setGsetGrid(120, 120, '', "", "", '',150);
                        else if (swlValue <= 1250) setGrid(140, 140, '', "", "", '',170);
                        else if (swlValue <= 1500) setGrid(160, 170, '', "", "", '',190);
                        else if (swlValue <= 2000) setGrid(200, 200, '', "", "", '',230);
                        else if (swlValue <= 2250) setGrid(230, 230, '', "", "", '',230);
                } else if (sf === "6:1") {
                    if (swlValue >= 0 && swlValue <= 500) setGrid(110, 110, '', "", "", '',140);
                    else if (swlValue <= 1000) setGrid(140, 140, '', "", "", '',170);
                    else if (swlValue <= 1250) setGrid(160, 160, '', "", "", '',190);
                    else if (swlValue <= 1500) setGrid(180, 180, '', "", "", '',210);
                    else if (swlValue <= 2000) setGrid(230, 230, '', "", "", '',260);
                    else if (swlValue <= 2250) setGrid(250, 250, '', "", "", '',260);
                } 
                    const unit = document.getElementById('h_unit')?.value || 'cm'; 

                    // Convert sizes (only once)
                    let convertedSizeL = sizeL;
                    let convertedSizeW = sizeW;
                    let convertedSizeH = sizeH;

                    if (unit === 'inch') {
                        convertedSizeL = sizeL * 2.54;
                        convertedSizeW = sizeW * 2.54;
                        convertedSizeH = sizeH * 2.54;
                    }
                    

                rows[0]?.cells[4] && (
                        rows[0].cells[4].innerText = Math.round(convertedSizeL + 12)
                        
                    );

                    rows[6]?.cells[4] && (
                        rows[6].cells[4].innerText = Math.round(
                                (convertedSizeL + 10)
                        )
                    );

                    rows[2]?.cells[4] && (
                        rows[2].cells[4].innerText = Math.round(convertedSizeL + convertedSizeW)
                        
                    );

                    rows[6]?.cells[5] && (
                        rows[6].cells[5].innerText = Math.round(
                                (convertedSizeW + 10)
                        )
                    );

                    singleLoopCutsize();

                    
            }
            else if (constructionType === "DOUBLE LOOP"){ 
                
                rows[29]?.cells[2] && (rows[29].cells[2].innerText = 5);
                rows[29]?.cells[5] && (rows[29].cells[5].innerText = 100);
                rows[29]?.cells[3] && (rows[29].cells[3].innerText = "PP/MW");
                rows[29]?.cells[4] && (rows[29].cells[4].innerText = "15mm");

                rows[19]?.cells[2] && (rows[19].cells[2].innerText = 90);
                rows[19]?.cells[3] && (rows[19].cells[3].innerText = 20);
                rows[19]?.cells[4] && (rows[19].cells[4].innerText = 30);
                rows[19]?.cells[5] && (rows[19].cells[5].innerText = 35);
                rows[15]?.cells[4] && (rows[15].cells[4].innerText = 0);

                document.getElementById("loop_x").value = "0";
                document.getElementById("loop_fh").value = "0";
                document.getElementById("body_loop1").value = "2";

                if (sf === "5:1") {
                    if (swlValue >= 0 && swlValue <= 500) setGrid(90, 90, '', "", "", '',120);
                        else if (swlValue <= 1000) setGsetGrid(120, 120, '', "", "", '',150);
                        else if (swlValue <= 1250) setGrid(140, 140, '', "", "", '',170);
                        else if (swlValue <= 1500) setGrid(160, 170, '', "", "", '',190);
                        else if (swlValue <= 2000) setGrid(200, 200, '', "", "", '',230);
                        else if (swlValue <= 2250) setGrid(220, 220, '', "", "", '',230);
                } else if (sf === "6:1") {
                    if (swlValue >= 0 && swlValue <= 500) setGrid(110, 110, '', "", "", 0,140);
                    else if (swlValue <= 1000) setGrid(140, 140, '', "", "", 45,170);
                    else if (swlValue <= 1500) setGrid(220, 220, 60, "80mm", 50, 50,220);
                    // else if (swlValue <= 1500) setGrid(180, 180, '', "", "", '',210);
                    else if (swlValue <= 2000) setGrid(264, 264, 65, "80mm", 50, 50,270);
                    else if (swlValue <= 2250) setGrid(286, 286, 70, "80mm", 50, 500,290);
                } 
                const unit = document.getElementById('h_unit')?.value || 'cm'; 

                    // Convert sizes (only once)
                    let convertedSizeL = sizeL;
                    let convertedSizeW = sizeW;
                    let convertedSizeH = sizeH;

                    if (unit === 'inch') {
                        convertedSizeL = sizeL * 2.54;
                        convertedSizeW = sizeW * 2.54;
                        convertedSizeH = sizeH * 2.54;
                    }
                    

                rows[0]?.cells[4] && (
                        rows[0].cells[4].innerText = Math.round(convertedSizeL + 11)
                        
                    );

                    rows[6]?.cells[4] && (
                        rows[6].cells[4].innerText = Math.round(
                                (convertedSizeL + 10)
                        )
                    );

                    rows[2]?.cells[4] && (
                        rows[2].cells[4].innerText = Math.round(convertedSizeL + convertedSizeW)
                        
                    );

                    rows[6]?.cells[5] && (
                        rows[6].cells[5].innerText = Math.round(
                                (convertedSizeW + 10)
                        )
                    );

                    singleLoopCutsize();
            } 

            function singleLoopCutsize() {
                try {
                    const constructionType = document.getElementById("bag_type").value;
                    const loopCoverBox = document.getElementById("loop_cover");
                    const bodySlitLoopValue = parseFloat(document.getElementById('body_loop1').value) || 0;
                    const sideSlitLoopValue = parseFloat(document.getElementById('side_loop1').value) || 0;
                    const rows = document.querySelectorAll('#dataGridView1 tbody tr');


                   (document.getElementById("bag_type"));
                   (document.getElementById("loop_cover"));
                   (document.getElementById('body_loop1'));
                   (document.getElementById('side_loop1'));
                   (document.querySelectorAll('#dataGridView1 tbody tr'));


                   ("Rows length:", rows.length);

                    const hasLoopRow = Array.from(rows).some(row =>
                        row.cells[0]?.innerText.trim().toUpperCase() === 'LOOP'
                    );

                    if (hasLoopRow) return; // already processed

                    if (bodySlitLoopValue > 0 && rows[0]) {
                        let currentVal = parseFloat(rows[0].cells[4].innerText) || 0;
                       ("Row 0, Cell 4 Value Before:", currentVal);

                        if (constructionType === "U+2") {
                            currentVal += bodySlitLoopValue * 2 + 20;
                        } else {
                            currentVal += bodySlitLoopValue + 10;
                        }

                        rows[0].cells[4].innerText = currentVal;
                        loopCoverBox.value = "SLEEVE";
                    } else if (sideSlitLoopValue > 0 && rows[2]) {
                        let currentVal = parseFloat(rows[2].cells[4].innerText) || 0;
                       ("Row 2, Cell 4 Value Before:", currentVal);

                        currentVal += sideSlitLoopValue + 10;
                        rows[2].cells[4].innerText = currentVal;
                        loopCoverBox.value = "SLEEVE";
                    }

                } catch (err) {
                    ("Error in singleLoopCutsize:", err);
                }
            }
            function baffle_all() {
                    const table = document.querySelector('#dataGridView1 tbody');
                    const rows = table ? table.rows : [];
                    const ct = document.getElementById("bag_type").value;
                    const bfCt = document.getElementById("baffle_construction_type").value;
                    const bfFt = document.getElementById("baffle_fabric_type").value;
                    const lType = document.getElementById('l_int_type')?.value || "INT";
                    
                    let sizeH = parseFloat(document.getElementById("size_H_box").value) || 0;
                    let sizeL = parseFloat(document.getElementById("size_l_box").value) || 0;
                    let sizeW = parseFloat(document.getElementById("size_W_box").value) || 0;
                    

                    if (
                        ct === "2 PNL BFL CC" ||
                        ct === "4 PNL BFL CC" ||
                        ct === "4 PNL BFL CNR" ||
                        ct === "CIRCULAR CC BFL" ||
                        ct === "PINCH CORNER BAFFLE" ||
                        ct === "U+2 BAFFLE" ||
                        ct === "U+2 CC BAFFLE"
                    ) {
                        try {

                            if (unit === 'inch') {
                                sizeL = sizeL * 2.54;
                                sizeW = sizeW * 2.54;
                                sizeH = sizeH * 2.54;
                            }
                            const lVal = sizeL;
                            const wVal = sizeW;
                            const hVal = sizeH;

                            if (lType === "INT" || ct === "CIRCULAR CC BFL") {
                                if (sizeL && sizeW && sizeH) {
                                    const a = lVal - wVal;
                                    const b = wVal - lVal;

                                    if (sizeL !== sizeW && (a > 25 || b > 25)) {
                                        if (lVal > wVal) {
                                            const abc = (lVal / 3) * (lVal / 3);
                                            const bca = (wVal / 2) * (wVal / 2);
                                            const cba = abc + bca;

                                            rows[31].cells[4].innerText = Math.round(Math.sqrt(cba) + 10);
                                            rows[31].cells[5].innerText = Math.round(hVal - 15);
                                            if (ct === "CIRCULAR CC BFL") {
                                                rows[31].cells[5].innerText = Math.round(hVal - 20);
                                            }
                                        } else if (wVal > lVal) {
                                            const abc = (lVal / 2) * (lVal / 2);
                                            const bca = (wVal / 3) * (wVal / 3);
                                            const cba = abc + bca;

                                            rows[31].cells[4].innerText = Math.round(Math.sqrt(cba) + 10);
                                            rows[31].cells[5].innerText = Math.round(hVal - 15);
                                            if (ct === "CIRCULAR CC BFL") {
                                                rows[31].cells[4].innerText = Math.round(hVal - 20);
                                            }
                                        }
                                    } else {
                                        const abc = (lVal / 3) * (lVal / 3);
                                        const bca = (wVal / 3) * (wVal / 3);
                                        const cba = abc + bca;

                                        rows[31].cells[4].innerText = Math.round(Math.sqrt(cba) + 10);
                                        rows[31].cells[5].innerText = Math.round(hVal - 15);
                                        if (ct === "CIRCULAR CC BFL") {
                                            rows[31].cells[5].innerText = Math.round(hVal - 20);
                                        }
                                    }
                                }
                            } else {
                                const abc = (lVal / 3) * (lVal / 3);
                                const bca = (wVal / 3) * (wVal / 3);
                                const cba = abc + bca;

                                rows[31].cells[4].innerText = Math.round(Math.sqrt(cba) + 10);
                                rows[31].cells[5].innerText = Math.round(hVal - 15);
                            }

                            if (bfCt === "CENTER") {
                                rows[31].cells[3].innerText = Math.round(lVal + 8);
                                rows[31].cells[4].innerText = Math.round(hVal - 15);
                            }

                            if (bfFt === "FABRIC") {
                                rows[31].cells[2].innerText = 90;
                                rows[31].cells[3].innerText = 40;
                                // if (document.getElementById("baffleSingle").checked) {
                                //     rows[31].cells[3].innerText = 40;
                                // } else if (document.getElementById("baffleDouble").checked) {
                                //     rows[31].cells[3].innerText = 20;
                                // }
                            } else if (bfFt === "NET") {
                                rows[31].cells[2].innerText = 50;
                                rows[31].cells[3].innerText = 0;
                                rows[31].cells[5].innerText = rows[0].cells[4].innerText;
                            }

                            if (document.getElementById("baffleDouble").checked) {
                                try {
                                    const halfLam = Math.round(Number(rows[31].cells[3].innerText) / 2);
                                    const fabric = rows[31].cells[2].innerText;
                                    // let total = Number(halfLam) + Number(fabric) + Number(halfLam);
                                rows[31].cells[13].innerText = fabric.toString() + " + " + halfLam.toString();
                                    // rows[31].cells[13].innerText = finaltotal;
                                } catch (e) {}
                            } else {
                                try {
                                    rows[31].cells[13].innerText =
                                        `${rows[31].cells[2].innerText} + ${rows[31].cells[3].innerText}`;
                                } catch (e) {}
                            }
                        } catch (err) {
                           (err);
                        }
                    }
            }

            function hemming_liner() {
                const linerAttachment = document.getElementById("attachment")?.value || "";
                const rows = document.querySelectorAll("#dataGridView1 tbody tr");

                if (rows.length < 12) return; // Ensure enough rows

                function incrementCell(rowIndex, cellIndex, addValue) {
                    const cell = rows[rowIndex]?.cells[cellIndex];
                    if (!cell) return;

                    let currentValue = parseInt(cell.innerText) || 0; // default 0
                    cell.innerText = currentValue + addValue;
                }

                if (linerAttachment === "HEMMING-BOTH") {
                    incrementCell(8, 4, 2);
                    incrementCell(8, 5, 5);
                    incrementCell(11, 4, 2);
                    incrementCell(11, 5, 5);
                } 
                else if (linerAttachment === "HEMMING-FS") {
                    incrementCell(8, 4, 2);
                    incrementCell(8, 5, 5);
                } 
                else if (linerAttachment === "HEMMING-DS") {
                    incrementCell(11, 4, 2);
                    incrementCell(11, 5, 5);
                }
            }

            function liner_asia() {
                try {
                    const liner_design = document.getElementById("liner_design_box").value;
                    const liner_microns_box = document.getElementById("liner_microns_box");
                    const liner_attachment = document.getElementById("attachment").value;
                    const bfl_liner = document.getElementById("baffleLiner").checked;

                   let size_l_value = parseFloat(document.getElementById("size_l_box").value) || 0;
                    let size_w_value = parseFloat(document.getElementById("size_W_box").value) || 0;
                    let size_h_value = parseFloat(document.getElementById("size_H_box").value) || 0;

                    let skirt = parseFloat(document.getElementById("skirt_box").value) || 0;
                    let fsH = parseFloat(document.getElementById("f_s_size_H_box").value) || 0;
                    let dsH = parseFloat(document.getElementById("ds_size_H_box").value) || 0;

                    const rows = document.querySelector("#dataGridView1 tbody").rows;
                    
                    if (liner_design !== "N/A") {
                        // Enable microns box
                        liner_microns_box.disabled = false;

                        // Reset extra row cells
                        // for (let i = 1; i <= 7; i++) {
                        //     rows[34].cells[i].innerText = 0;
                        // }

                        // Base size calculation

                        if (unit === 'inch') {
                            size_l_value = size_l_value * 2.54;
                            size_w_value = size_w_value * 2.54;
                            size_h_value = size_h_value * 2.54;
                            skirt =  skirt * 2.54;
                            fsH = fsH * 2.54;
                            dsH = dsH * 2.54;
                        }

                        let baseSize = size_l_value + size_w_value + 5;
                        if (liner_attachment === "GLUED") baseSize += 5;
                        if (["FLANGE", "FLANGE TABBING 4 POINTS", "FLANGE TABBING 8 POINTS"].includes(liner_attachment)) {
                            baseSize += 20;
                        }

                        rows[33].cells[4].innerText = Math.round(baseSize);
                        rows[33].cells[13].innerText = (liner_attachment !== "N/A") ? liner_attachment : "";

                        // Height calculation
                        if (fsH && dsH) {
                            rows[33].cells[5].innerText = Math.round(fsH + ((size_w_value + size_l_value) / 2) + size_h_value + dsH + 20);
                        } else if (skirt && dsH) {
                            rows[33].cells[5].innerText = Math.round(skirt + ((size_w_value + size_l_value) / 4) + size_h_value + dsH + 20);
                        } else if (skirt && !dsH) {
                            rows[33].cells[5].innerText = Math.round(skirt + ((size_w_value + size_l_value) / 4) + size_h_value + 20);
                        } else if (fsH && !dsH) {
                            rows[33].cells[5].innerText = Math.round(fsH + ((size_w_value + size_l_value) / 2) + size_h_value + 20);
                        } else if (!fsH && !dsH) {
                            rows[33].cells[5].innerText = Math.round(((size_w_value + size_l_value) / 2) - 10 + size_h_value + ((size_w_value + size_l_value) / 4) + 20);
                        } else if (!fsH && dsH) {
                            rows[33].cells[5].innerText = Math.round(((size_w_value + size_l_value) / 2) - 10 + size_h_value + ((size_w_value + size_l_value) / 4) + 20 + dsH);
                        }

                        // If baffle liner selected
                        if (bfl_liner) {
                            liner_baffle_all();
                        }

                    } else {
                        // If liner design is N/A
                        liner_microns_box.value = "0";
                        liner_microns_box.disabled = true;

                        rows[33].cells[4].innerText = 0;
                        rows[33].cells[5].innerText = 0;
                    }

                    // Update microns row
                    liner_microns();

                } catch (err) {
                    (err);
                }
            }
            function liner_baffle_all() {
                try {
                    const constructionTypeEl = document.getElementById("bag_type");
                    const bagSizeForEl = document.getElementById("l_int_type");
                    const LBox = document.getElementById("size_l_box");
                    const WBox = document.getElementById("size_W_box");
                    const HBox = document.getElementById("size_H_box");
                    const table = document.querySelector("#dataGridView1 tbody");

                    if (!constructionTypeEl || !bagSizeForEl || !table) {
                        console.warn("âš ï¸ Required elements not found.");
                        return;
                    }

                    const construction_type = constructionTypeEl.value.toUpperCase();
                    const bagsize_for = bagSizeForEl.value;
                    const rows = table.rows;

                    let size_l_value = parseFloat(LBox?.value) || 0;
                    let size_w_value = parseFloat(WBox?.value) || 0;
                    let size_h_value = parseFloat(HBox?.value) || 0;

                    // Safe row check
                    if (rows.length <= 34) {
                        console.warn("âš ï¸ Not enough rows in table for liner_baffle_all");
                        return;
                    }

                    if (!construction_type.includes("BFL") && !construction_type.includes("BAFFLE")) {
                       ("âœ… Condition chal rahi hai kyunki BFL ya BAFFLE nahi hai");

                        rows[34].cells[2].innerText = 200;

                        let abc, bca, cba;
                        if (unit === 'inch') {
                            size_l_value = size_l_value * 2.54;
                            size_w_value = size_w_value * 2.54;
                            size_h_value = size_h_value * 2.54;
                        
                        }
                        const L = size_l_value;
                        const W = size_w_value;
                        const H = size_h_value;

                        const isCircular = construction_type === "CIRCULAR CC BFL";

                        if (bagsize_for === "INT" || isCircular) {
                            if (L && W && H) {
                                const diff1 = Math.abs(L - W);

                                if (L !== W && diff1 > 25) {
                                    if (L > W) {
                                        abc = (L / 3) ** 2;
                                        bca = (W / 2) ** 2;
                                    } else {
                                        abc = (L / 2) ** 2;
                                        bca = (W / 3) ** 2;
                                    }
                                } else {
                                    abc = (L / 3) ** 2;
                                    bca = (W / 3) ** 2;
                                }

                                cba = abc + bca;
                                rows[34].cells[4].innerText = Math.round(Math.sqrt(cba) + 8);
                                rows[34].cells[5].innerText = Math.round(H - (isCircular ? 20 : 15));
                            }
                        } else {
                            abc = (L / 3) ** 2;
                            bca = (W / 3) ** 2;
                            cba = abc + bca;

                            rows[34].cells[4].innerText = Math.round(Math.sqrt(cba) + 8);
                            rows[34].cells[5].innerText = Math.round(H - 15);
                        }
                    }
                } catch (err) {
                    ("âŒ Error in liner_baffle_all:", err);
                }
            }
            function liner_microns() {
                try {
                    const liner_type = document.getElementById("liner_type_box")?.value || "";
                    const liner_microns_val = document.getElementById("liner_microns_box")?.value || 0;
                    const table = document.querySelector("#dataGridView1 tbody");

                    if (!table) {
                        console.warn("âš ï¸ Table not found");
                        return;
                    }

                    const rows = table.rows;

                    if (rows.length > 33) {
                        rows[33].cells[2].innerText =
                            (liner_type.toUpperCase() !== "N/A" && liner_type.trim() !== "")
                                ? liner_microns_val   // âœ… true case â†’ microns à¤•à¥€ value
                                : 0;                  // âœ… false case â†’ 0
                    }  else {
                                    console.warn("âš ï¸ Row 33 not found");
                                }
                } catch (err) {
                    ("âŒ Error in liner_microns:", err);
                }
            }
        
            function fs_with_rope_new() {
                try {
                   ("ðŸ“Œ fs_with_rope_new() called");

                    let skirt_box = document.getElementById("skirt_box");
                    let f_s_size_D_box = document.getElementById("f_s_size_D_box");
                    let f_s_size_H_box = document.getElementById("f_s_size_H_box");

                    // UN ka value as string
                    const UN = document.getElementById('UN_checkbox')?.value || "0";

                    const bagsize_for_box = document.getElementById("l_int_type");
                    const CONICAL_TOP = document.getElementById("conicalTop");

                    let size_w_value = parseFloat(document.getElementById("size_W_box")?.value) || 0;
                    let size_l_value = parseFloat(document.getElementById("size_l_box")?.value) || 0;

                    if (unit === 'inch') {
                            size_l_value = size_l_value * 2.54;
                            size_w_value = size_w_value * 2.54;
                            f_s_size_D_box = f_s_size_D_box * 2.54;
                            f_s_size_H_box = f_s_size_H_box * 2.54;
                        
                        }

                  fs_ds_Skirt_standard() 

                    const table = document.querySelector("#dataGridView1 tbody");
                    if (!table) {
                        ("âŒ Table not found: #dataGridView1 tbody");
                        return;
                    }

                    const rows = table.rows;

                    if (
                        (skirt_box.value === "" || skirt_box.value === "0") &&
                        (f_s_size_D_box.value !== "" && f_s_size_D_box.value !== "0" &&
                            f_s_size_H_box.value !== "" && f_s_size_H_box.value !== "0")
                    ) {


                        // âœ… Fabric Size (Column 2)
                        if (UN === "X") {
                            rows[4].cells[2].innerText = rows[0].cells[2].innerText;
                        } else if (UN === "Y") {
                            rows[4].cells[2].innerText = 140;
                        } else if (UN === "Z") {
                            rows[4].cells[2].innerText = 130;
                        } else {
                            rows[4].cells[2].innerText = fs_ds_skirt_fabric_size;
                        }

                        // âœ… Lamination (Column 3)
                        if (["X", "Y", "Z"].includes(UN)) {
                            rows[4].cells[3].innerText = 30;
                        } else {
                            rows[4].cells[3].innerText = fs_ds_skirt_lamination;
                        }

                        

                        // âœ… Cut Size W (Column 4)
                        rows[4].cells[4].innerText = Math.round(size_w_value + (bagsize_for_box.value === "EXT" ? 12 : 11));

                        // âœ… Cut Size L (Column 5)
                        rows[4].cells[5].innerText = Math.round(size_l_value + (bagsize_for_box.value === "EXT" ? 12 : 11));

                        // âœ… Conical Top adjustment
                        if (CONICAL_TOP.checked) {
                            rows[4].cells[4].innerText = Math.round(parseFloat(rows[4].cells[4].innerText) + 22);
                            rows[4].cells[5].innerText = Math.round(parseFloat(rows[4].cells[5].innerText) + 22);
                        }

                        //("âœ… Table updated successfully");
                    }
                } catch (err) {
                    // ("âŒ Error in fs_with_rope_new():", err);
                }
            }
            
            function swl_value_converter() {
                let swlValue = 0;
                let  swlBox = document.getElementById("swl")?.value || "0";
                let swlKgLbs = document.getElementById("swl2")?.value || "KG";

                try {
                    if (swlKgLbs === "LBS") {
                        swlValue = parseFloat((parseFloat(swlBox) / 2.205).toFixed(0));
                    } else {
                        swlValue = parseFloat(swlBox);
                    }
                } catch (e) {
                    swlValue = 0;
                }

                return swlValue;
            }

            function fs_ds_Skirt_standard() {
             
                const fsInput = document.querySelector('input[name="fs_gsm"]')?.value.trim();
                const dsInput = document.querySelector('input[name="ds_gsm"]')?.value.trim();

                if (fsInput || dsInput) {
                    return; 
                }

                
                const swlValue = swl_value_converter();

                if (swlValue < 1500) {
                    fs_ds_skirt_fabric_size = 65;
                    fs_ds_skirt_lamination   = 20;
                } else if (swlValue <= 2000) {
                    fs_ds_skirt_fabric_size = 90;
                    fs_ds_skirt_lamination   = 20;
                } else {
                    fs_ds_skirt_fabric_size = 100;
                    fs_ds_skirt_lamination   = 20;
                }
            }


            document.getElementById("band_design_box").addEventListener("change", band_calc);
            function band_calc() {
                // --- Get input values ---
                let sizeL = parseFloat(document.getElementById('size_l_box')?.value) || 0;
                let sizeW = parseFloat(document.getElementById('size_W_box')?.value) || 0;
                let swlValue = parseFloat(document.getElementById('swlSearch')?.value) || 0;
                let bandType = (document.getElementById('band_design_box')?.value || "").toUpperCase();
                const unit = document.getElementById('h_unit')?.value || "cm";

                if (unit === 'inch') {
                    sizeL *= 2.54;
                    sizeW *= 2.54;
                }

                const total = ((sizeL + sizeW) * 2) + 30;

                const rows = [20, 21];

                // --- Helper to set cell value ---
                function setCell(row, col, val) {
                    const table = document.getElementById("dataGridView1");
                    if (table && table.rows[row] && table.rows[row].cells[col]) {
                        table.rows[row].cells[col].innerText = val || 0;
                    }
                }

                // --- Reset affected rows first ---
                for (let r of rows) {
                    for (let c = 2; c <= 7; c++) setCell(r, c, 0);
                }

                // --- Apply new values based on selection ---
                switch (bandType) {
                    case "TOP BAND":
                        setCell(20, 5, total);
                        setCell(20, 4, "40mm");
                        setCell(20, 2, swlValue < 1251 ? 20 : 25);
                        break;

                    case "CENTER BAND":
                    case "CENTER BAND-2":
                        setCell(21, 5, total);
                        setCell(21, 2, swlValue < 1251 ? 20 : 25);
                        break;

                    case "BOTH":
                    case "BOTH(CENTER BAND-2)":
                        setCell(20, 5, total);
                        setCell(21, 5, total);

                        setCell(20, 4, "40");
                        setCell(20, 2, swlValue < 1251 ? 20 : 25);
                        setCell(21, 2, swlValue < 1251 ? 20 : 25);
                        break;

                    default:
                        // Already reset above, do nothing
                        break;
                }
            }
      
            function updateCell(cell, value) {
                if (!cell) return;
                const input = cell.querySelector("input");
                if (input) input.value = value;
                else cell.innerText = value;
            }

            function setRow(row, gsm, lam, fabricSize, cutSize) {
                if (!row) return;
                const cells = row.cells;
                updateCell(cells[2], gsm);
                updateCell(cells[3], lam);
                updateCell(cells[4], fabricSize);
                updateCell(cells[5], cutSize);
               
            }

            function clearRow(row) {
                if (!row) return;
                setRow(row, 0, 0, 0, 0);
            }

            function handleSkirtOrFS() {
                // --- Get input values ---
                let skirtValue = parseFloat(document.getElementById("skirt_box")?.value) || 0;
                let fsD = parseFloat(document.getElementById("f_s_size_D_box")?.value) || 0;
                let fsH = parseFloat(document.getElementById("f_s_size_H_box")?.value) || 0;
                const isRopeSelected = document.getElementById("fs_rope")?.checked;
                const skirtRopeSelected = document.getElementById("skirt_box_rope")?.checked;
                const fsEdgeChecked = document.getElementById('fs_edge_hemm')?.checked;
                const attachmentValue = document.getElementById("attachment")?.value || "";
                const unit = document.getElementById('h_unit')?.value || "cm";
                const fsHemmSelect = document.getElementById('hemm_fs_select')?.value?.trim().toUpperCase() || "N/A";
                const hygieneChecked = document.getElementById("hygiene")?.value || "";
                
                // --- Enable/Disable inputs based on Skirt / FS activity ---
                const isFSActive = (fsD > 0 || fsH > 0) && !skirtValue;
                const isSkirtActive = skirtValue > 0 && fsD === 0 && fsH === 0;

                document.getElementById("f_s_size_D_box").disabled = isSkirtActive;
                document.getElementById("f_s_size_H_box").disabled = isSkirtActive;
                document.getElementById("fs_rope").disabled = isSkirtActive;
                document.getElementById("hemm_fs_select").disabled = isSkirtActive;
                document.getElementById("hemm_fs_rope").disabled = isSkirtActive;
                document.getElementById("skirt_box_rope").disabled = isFSActive;
                document.getElementById("skirt_box").disabled = isFSActive;

                // --- Table rows ---
                const rows = Array.from(document.querySelectorAll("#dataGridView1 tbody tr"));

                const getRow = (seriesName) => {
                    return rows.find(r => r.cells[0]?.innerText.trim().toUpperCase() === seriesName.toUpperCase());
                }

                const fsRow = getRow('F/SKIRT');
                const ropeRow = getRow('FS ROPE');
                const tieRow = getRow('FS TIE');
                const petalRopeRow = getRow('PETAL ROPE');
                const petalTieRow = getRow('PETAL TIE');
                const petalCoverRow = getRow('PETAL COVER');
                const petalPadRow = getRow('PETAL PAD');
                const irisRopeRow = getRow('IRIS ROPE');
                const irisTieRow = getRow('IRIS TIE');
                const irisFabricRow = getRow('IRIS FABRIC');

                const fabricGSM = fs_ds_skirt_fabric_size; // global variable
                const lamination = fs_ds_skirt_lamination; // global variable

                // --- Handle Skirt Active ---
                 if (hygieneChecked === "FOOD GRADE") fabricSize += 5;
                if (isSkirtActive) {
                    if (unit === 'inch') skirtValue *= 2.54;
                    
                    
                    if (typeof sizeL !== 'undefined' && typeof sizeW !== 'undefined' && typeof sizeH !== 'undefined') {
                        if (unit === 'inch') { sizeL *= 2.54; sizeW *= 2.54; sizeH *= 2.54; }
                        if (lType === "EXT") { sizeW -= 5; sizeH -= 5; }
                    }

                    let fabricSize = skirtValue + 3;
                    let cutSize = ((sizeL + sizeW) * 2 + 12) || 0;
                     if (fsEdgeChecked) fabricSize += 5;
                    if (attachmentValue === "HEMMING-FS" || attachmentValue === "HEMMING-BOTH") {
                        fabricSize += 2;
                        cutSize += 5;
                    }

                    setRow(fsRow, fabricGSM, lamination, Math.round(fabricSize), Math.round(cutSize));

                    if (skirtRopeSelected) { setRow(ropeRow, 12, "MW", "6mm", 125); clearRow(tieRow); }
                    else { setRow(tieRow, 5, "PP/MW", "15mm", 125); clearRow(ropeRow); }
                }

                // --- Handle FS Active ---
                if (isFSActive) {
                    if (unit === 'inch') { fsD *= 2.54; fsH *= 2.54; }
                    if (hygieneChecked === "FOOD GRADE") fabricSize += 5;
                    let fabricSize = Math.round(fsH + 5);
                    let fsCutSize = Math.round(fsD * 3.14 + 12);
                     if (fsEdgeChecked) fabricSize += 5;
                    if (attachmentValue === "HEMMING-FS" || attachmentValue === "HEMMING-BOTH") {
                        fabricSize += 2;
                        fsCutSize += 5;
                    }

                    setRow(fsRow, fabricGSM, lamination, fabricSize, fsCutSize);

                    if (isRopeSelected) { setRow(ropeRow, 12, "MW", "6mm", 125); clearRow(tieRow); }
                    else { setRow(tieRow, 5, "PP/MW", "15mm", 125); clearRow(ropeRow); }
                }

                // --- Handle Hemming PETAL ---
                if (fsHemmSelect === "PETAL" && fsRow) {
                    let fabricSize = fsD;
                    let cutSize = fsD;
                     if (hygieneChecked === "FOOD GRADE") fabricSize += 5;
                    if (attachmentValue === "HEMMING-FS" || attachmentValue === "HEMMING-BOTH") { fabricSize += 2; cutSize += 5; }
                    const isRope = document.getElementById("hemm_fs_rope")?.checked;
                    setRow(petalCoverRow, 150, 30, fsD - 5, fsD - 5);
                    setRow(petalPadRow, 150, 30, 10, 10);
                    if (isRope) { setRow(petalRopeRow, 12, "BR/MW", "6mm", Math.round(fsD * 3.14 + 50)); clearRow(petalTieRow); }
                    else { setRow(petalTieRow, 5, "PP/MW", "15mm", Math.round(fsD * 3.14 + 50)); clearRow(petalRopeRow); }
                }

                // --- Handle Hemming IRIS ---
                if (fsHemmSelect === "IRIS" && fsRow) {
                    let fabricSize = fsD / 2 + fsH + 14;
                    let cutSize = parseFloat(fsRow.cells[5]?.querySelector("input")?.value || fsRow.cells[5]?.innerText) || 0;
                    if (hygieneChecked === "FOOD GRADE") fabricSize += 5;
                    if (fsEdgeChecked) fabricSize += 5;
                    if (attachmentValue === "HEMMING-FS" || attachmentValue === "HEMMING-BOTH") { fabricSize += 2; cutSize += 5; }

                    const gsm = parseFloat(fsRow.cells[2]?.querySelector("input")?.value || fsRow.cells[2]?.innerText) || 0;
                    const lam = parseFloat(fsRow.cells[3]?.querySelector("input")?.value || fsRow.cells[3]?.innerText) || 0;

                    setRow(fsRow, Math.round(gsm), Math.round(lam), Math.round(fabricSize), Math.round(cutSize));

                    const isRope = document.getElementById("hemm_fs_rope")?.checked;
                    setRow(irisFabricRow, 150, 30, 30, 30);
                    if (isRope) { setRow(irisRopeRow, 12, "BR/MW", "6mm", Math.round(fsD * 3.14 + 50)); clearRow(irisTieRow); }
                    else { setRow(irisTieRow, 5, "PP/MW", "15mm", Math.round(fsD * 3.14 + 50)); clearRow(irisRopeRow); }
                }
            }

           function calculateDSTieOrRope() {
                // --- Get input values ---
                let dsD = parseFloat(document.getElementById("ds_size_D_box")?.value) || 0;
                let dsH = parseFloat(document.getElementById("ds_size_H_box")?.value) || 0;
                const dsRope = document.getElementById("ds_rope")?.checked;
                const dsEdgeChecked = document.getElementById('ds_edge_hemm')?.checked;
                const attachmentValue = document.getElementById("attachment")?.value || "";
                const unit = document.getElementById('h_unit')?.value || "cm";
                const dsHemmSelect = document.getElementById('hemm_ds_select')?.value?.trim().toUpperCase() || "N/A";
                const hygieneChecked = document.getElementById("hygiene")?.value || "";

                // --- Convert units if needed ---
                if (unit === 'inch') { dsD *= 2.54; dsH *= 2.54; }

                // --- Table rows ---
                const rows = Array.from(document.querySelectorAll("#dataGridView1 tbody tr"));
                const getRow = (seriesName) => rows.find(r => r.cells[0]?.innerText.trim().toUpperCase() === seriesName.toUpperCase());

                const dsRow = getRow('DS');
                const dsRopeRow = getRow('DS ROPE');
                const dsTieRow = getRow('DS TIE');
                const petalRopeRow = getRow('PETAL ROPE');
                const petalTieRow = getRow('PETAL TIE');
                const petalCoverRow = getRow('PETAL COVER');
                const petalPadRow = getRow('PETAL PAD');
                const irisRopeRow = getRow('IRIS ROPE');
                const irisTieRow = getRow('IRIS TIE');
                const irisFabricRow = getRow('IRIS FABRIC');

                // --- D/S main fabric and cut size ---
                if (dsD > 0 || dsH > 0) {
                    let fabricSize = dsH + 10;
                    let cutSize = Math.round(dsD * 3.14 + 12);

                    if (dsEdgeChecked) fabricSize += 5;
                    if (attachmentValue === "HEMMING-DS" || attachmentValue === "HEMMING-BOTH") { fabricSize += 2; cutSize += 5; }

                    setRow(dsRow, fs_ds_skirt_fabric_size, fs_ds_skirt_lamination, Math.round(fabricSize), Math.round(cutSize));

                    if (dsRope) { setRow(dsRopeRow, 12, "MW", "6mm", 125); clearRow(dsTieRow); }
                    else { setRow(dsTieRow, 5, "PP/MW", "15mm", 125); clearRow(dsRopeRow); }
                }

                // --- D/S Hemming PETAL ---
                if (dsHemmSelect === "PETAL" && dsRow) {
                    let fabricSize = dsD;
                    let cutSize = dsD;
                    const isRope = document.getElementById("hemm_ds_rope")?.checked;

                    setRow(petalCoverRow, 150, 30, dsD - 5, dsD - 5);
                    setRow(petalPadRow, 150, 30, 10, 10);
                     if (hygieneChecked === "FOOD GRADE") fabricSize += 5;

                    if (isRope) { setRow(petalRopeRow, 12, "BR/MW", "6mm", Math.round(dsD * 3.14 + 50)); clearRow(petalTieRow); }
                    else { setRow(petalTieRow, 5, "PP/MW", "15mm", Math.round(dsD * 3.14 + 50)); clearRow(petalRopeRow); }
                }

                // --- D/S Hemming IRIS ---
                if (dsHemmSelect === "IRIS" && dsRow) {
                    let fabricSize = dsD / 2 + dsH + 14;
                    let cutSize = parseFloat(dsRow.cells[5]?.querySelector("input")?.value || dsRow.cells[5]?.innerText) || 0;

                    if (hygieneChecked === "FOOD GRADE") fabricSize += 5;
                    if (dsEdgeChecked) fabricSize += 5;
                    if (attachmentValue === "HEMMING-DS" || attachmentValue === "HEMMING-BOTH") { fabricSize += 2; cutSize += 5; }

                    const gsm = parseFloat(dsRow.cells[2]?.querySelector("input")?.value || dsRow.cells[2]?.innerText) || 0;
                    const lam = parseFloat(dsRow.cells[3]?.querySelector("input")?.value || dsRow.cells[3]?.innerText) || 0;

                    setRow(dsRow, Math.round(gsm), Math.round(lam), Math.round(fabricSize), Math.round(cutSize));

                    const isRope = document.getElementById("hemm_ds_rope")?.checked;
                    setRow(irisFabricRow, 150, 30, 30, 30);
                    if (isRope) { setRow(irisRopeRow, 12, "BR/MW", "6mm", Math.round(dsD * 3.14 + 50)); clearRow(irisTieRow); }
                    else { setRow(irisTieRow, 5, "PP/MW", "15mm", Math.round(dsD * 3.14 + 50)); clearRow(irisRopeRow); }
                }
            }

           function processHemm() {
                // --- Get input values ---
                let sl = parseFloat(document.getElementById('short_length_loop_box')?.value) || 0;
                let ll = parseFloat(document.getElementById('long_length_loop_box')?.value) || 0;
                let fh = parseFloat(document.getElementById('loop_fh')?.value) || 0;
                const unit = document.getElementById('h_unit')?.value || "cm";

                // --- Convert units if needed ---
                if (unit === 'inch') {
                    fh *= 2.54;
                    sl *= 2.54;
                    ll *= 2.54;
                }

                // --- Calculate loop cut size ---
                const loopCutSize = (fh > 0 && sl > 0 && ll > 0) ? (fh * 2 + sl + ll) : 0;

                // --- Get the table row ---
                const loopRow = Array.from(document.querySelectorAll('#dataGridView1 tbody tr'))
                    .find(r => r.cells[0]?.innerText.trim().toUpperCase() === 'LOOP');

                // --- Update table if row exists ---
                if (loopRow) {
                    const cutCell = loopRow.cells[5];
                    const input = cutCell.querySelector("input");
                    if (input) input.value = loopCutSize > 0 ? Math.round(loopCutSize) : 0;
                    else cutCell.innerText = loopCutSize > 0 ? Math.round(loopCutSize) : 0;
                }
            }


            function calculateAllWeights() {
                    const table = document.querySelector('#dataGridView1 tbody');
                    if (!table) return;

                    const bagTypeInput = (document.getElementById("bag_type")?.value || "").trim().toUpperCase();

                    // --- Bag groups ---
                    const bagGroups = {
                        "U+2": ["U+2", "U+2 BAFFLE", "U+2 CC", "U+2 CC BAFFLE"],
                        "4PNL": ["4 PNL BFL CC", "4 PNL BFL CNR", "4 PNL CC", "4 PNL CNR"],
                        "CIRCULAR": ["CIRCULAR CC", "CIRCULAR CC BFL"],
                        "2PNL": ["2 PNL", "2 PNL BFL"],
                        "CC": ["4 PNL CC", "CIRCULAR CC", "U+2 CC", "U+2 CC BAFFLE"]
                    };

                    let matchedGroup = "";
                    for (const [group, names] of Object.entries(bagGroups)) {
                        if (names.some(name => bagTypeInput.includes(name))) {
                            matchedGroup = group;
                            break;
                        }
                    }

                    // -------- Fabric Calculation Function --------
                    function getFabricWeight(comp, val, size, cut, matchedGroup = "") {
                    val = parseFloat(val) || 0;
                    size = parseFloat(size) || 0;
                    cut = parseFloat(cut) || 0;

                    switch (comp) {
                        case "BODY":
                        case "INNER BODY":
                            if (matchedGroup === "U+2") return (val * size * cut) / 10000;
                            if (matchedGroup === "4PNL") return (val * size * cut * 2) / 10000;
                            if (matchedGroup === "2PNL") return (val * size * cut * 4) / 10000;
                            if (matchedGroup === "CIRCULAR") return (val * size * cut * 2) / 10000;
                            return (val * size * cut) / 10000;

                        case "SIDE":
                          

                             case "INNER SIDE":
                             if (matchedGroup === "U+2") return (val * size * cut *2) / 10000;
                            if (matchedGroup === "4PNL") return (val * size * cut * 2) / 10000;
                            if (matchedGroup === "2PNL") return (val * size * cut * 4) / 10000;
                            if (matchedGroup === "CIRCULAR") return (val * size * cut * 2) / 10000;
                            return (val * size * cut) / 10000;



                        case "TOP":
                        case "INNER TOP":
                        case "BOTTOM":
                        case "INNER BOTTOM":
                        case "F/SKIRT":
                        case "INNER FS":
                        case "DS":
                        case "INNER DS":
                            return (val * size * cut) / 10000;
                        case "SLEEVE":
                        return ((val * size * cut) / 10000) * 4;

                        case "FS TIE":
                        case "FS ROPE": {
                            let rope = parseFloat(document.getElementById("fs_TIE_ROPE")?.value) || 0;
                            return (val * cut) / 100 * rope;
                        }

                        case "DS TIE":
                        case "DS ROPE": {
                            let rope = parseFloat(document.getElementById("ds_TIE_ROPE")?.value) || 0;
                            return (val * cut) / 100 * rope;
                        }

                        case "STEVEDORE": return (val * cut * 2) / 100;
                        case "LOOP": return ((val * cut) / 100) * 4;
                        case "LOOP 2": return (val * cut * 4) / 100;
                        case "RING LOOP": return (val * cut * 2) / 100;
                        case "TOP BAND": return (val * cut) / 100;

                        case "BELLY BAND": {
                            let result = (val * cut) / 100;
                            const bandBox = document.getElementById("band_design_box")?.value?.trim() || "";
                            if (bandBox === "CENTER BAND-2" || bandBox === "BOTH(CENTER BAND-2)") {
                                result *= 2;
                            }
                            return result;
                        }

                        case "FLAP": return 0;

                        case "FLAP TIE": {
                            let topFlap = document.getElementById("topFlap")?.checked || false;
                            let bottomFlap = document.getElementById("bottomFlap")?.checked || false;
                            let ropeTop = parseFloat(document.getElementById("no_of_flap_tie_rope_top")?.value) || 0;
                            let ropeBottom = parseFloat(document.getElementById("no_of_flap_tie_rope_bottom")?.value) || 0;
                            if (topFlap || bottomFlap) {
                                return ((val * cut) / 100) * (ropeTop + ropeBottom);
                            }
                            return 0;
                        }

                        case "BAFFLE": {
                            let type = document.getElementById("baffle_fabric_type")?.value || "";
                            let construction = document.getElementById("baffle_construction_type")?.value || "";
                            let loopNo = parseFloat(document.getElementById("loop_no_box")?.value) || 0;
                            if (type !== "NET") return (val * size * cut / 10000) * 4;
                            if (construction === "CENTER") return (val * size * cut) / 10000;
                            if (type === "NET") return ((val * cut) / 100) * loopNo;
                            return 0;
                        }

                        case "LINER": return (val * size * cut * 0.923 / 10000) * 2;
                        case "LINER 2": {
                            let type = document.getElementById("liner_type_box")?.value || "N/A";
                            let microns = document.getElementById("liner_microns_box")?.value || "";
                            if (type !== "N/A" && microns !== "") {
                                return (val * size * cut * 0.92 * 4) / 10000;
                            }
                            return 0;
                        }

                        case "PATCH": return (val * size * cut) / 10000 * 8;

                        case "FULL LOOP1":
                        case "FULL LOOP2":
                            return document.getElementById("full_loop_box")?.checked ? ((val * cut) / 100) * 2 : 0;

                        case "IRIS FABRIC":
                            return (val * size * cut) / 10000;
                        case "PETAL PAD":
                            // Only return 10 if the user entered a value
                            return (val && val > 0) ? 10 : 0;
    
                        case "IRIS ROPE": {
                            let result = 0;

                            const dsOption = document.getElementById("hemm_ds_select")?.value || "";
                            const fsOption = document.getElementById("hemm_fs_select")?.value || "";

                            const dsChecked = document.getElementById("hemm_ds_rope")?.checked || false;
                            const fsChecked = document.getElementById("hemm_fs_rope")?.checked || false;

                    

                            // Case 1: koi ek Iris hai aur koi ek checkbox checked hai
                                if ((dsOption.toUpperCase() === "IRIS" || fsOption.toUpperCase() === "IRIS") && (dsChecked || fsChecked)) {
                                    result = (val * cut) / 100;
                                }

                                // Case 2: dono Iris hain aur dono checkbox checked hain â†’ double
                                if ((dsOption.toUpperCase() === "IRIS" && fsOption.toUpperCase() === "IRIS") && (dsChecked && fsChecked)) {
                                    result = ((val * cut) / 100) * 2;
                                }
                        
                            return result;
                        }


                        case "IRIS TIE": {
                            let result = 0;
                            const dsOption = document.getElementById("hemm_ds_select")?.value || "";
                            const fsOption = document.getElementById("hemm_fs_select")?.value || "";

                            const dsChecked = document.getElementById("hemm_ds_rope")?.checked || false;
                            const fsChecked = document.getElementById("hemm_fs_rope")?.checked || false;

                           ("IRIS TIE:", { dsOption, fsOption, dsChecked, fsChecked });

                            // Case 1: koi ek Iris hai aur koi ek checkbox checked hai
                            if ((dsOption.toUpperCase() === "IRIS" || fsOption.toUpperCase() === "IRIS") && (dsChecked || fsChecked)) {
                                result = (val * cut) / 100;
                            }

                            // Case 2: dono Iris hain aur dono checkbox checked hain â†’ double
                            if ((dsOption.toUpperCase() === "IRIS" && fsOption.toUpperCase() === "IRIS") && (dsChecked && fsChecked)) {
                                result = ((val * cut) / 100) * 2;
                            }
                            return result;
                        }


                       case "PETAL COVER": {

                            const fs = (document.getElementById("hemm_fs_select").value || "").toUpperCase();
                            const ds = (document.getElementById("hemm_ds_select").value || "").toUpperCase();

                        
                          
                            let col5 = 0;
                                let isPetal = (fs === "PETAL" || ds === "PETAL");

                            if (isPetal && val && size && cut) {
                                col5 = (val * size * cut) / 10000;

                                if(fs === "PETAL" && ds === "PETAL") {
                                    
                                    col5 = col5 * 2;
                                }
                            }

                            return col5;
                        }



                        case "PETAL ROPE": {
                            let result = 0;

                            const dsOption = document.getElementById("hemm_ds_select")?.value || "";
                            const fsOption = document.getElementById("hemm_fs_select")?.value || "";

                            const dsChecked = document.getElementById("hemm_ds_rope")?.checked || false;
                            const fsChecked = document.getElementById("hemm_fs_rope")?.checked || false;

                    

                            // Case 1: koi ek Iris hai aur koi ek checkbox checked hai
                                if ((dsOption.toUpperCase() === "PETAL" || fsOption.toUpperCase() === "PETAL") && (dsChecked || fsChecked)) {
                                    result = (val * cut) / 100;
                                }

                                // Case 2: dono Iris hain aur dono checkbox checked hain â†’ double
                                if ((dsOption.toUpperCase() === "PETAL" && fsOption.toUpperCase() === "PETAL") && (dsChecked && fsChecked)) {
                                    result = ((val * cut) / 100) * 2;
                                }
                        
                            return result;
                        }

                        case "PETAL TIE": {
                        let result = 0;

                            const dsOption = document.getElementById("hemm_ds_select")?.value || "";
                            const fsOption = document.getElementById("hemm_fs_select")?.value || "";

                            const dsChecked = document.getElementById("hemm_ds_rope")?.checked || false;
                            const fsChecked = document.getElementById("hemm_fs_rope")?.checked || false;

                           ("IRIS TIE INPUT =>", { val, cut, dsOption, fsOption, dsChecked, fsChecked });

                            // Case 1: koi ek Iris hai aur dono unchecked
                            if ((dsOption.toUpperCase() === "PETAL" || fsOption.toUpperCase() === "PETAL") && (!dsChecked && !fsChecked)) {
                                result = (val * cut) / 100;
                            }

                            // Case 2: dono Iris hain aur dono unchecked â†’ double
                            if ((dsOption.toUpperCase() === "PETAL" && fsOption.toUpperCase() === "PETAL") && (!dsChecked && !fsChecked)) {
                                result = ((val * cut) / 100) * 2;
                            }

                           ("IRIS TIE RESULT =>", result);
                            return result;
                        }


                        default:
                            return (val * size * cut) / 10000;
                    }
                }

                    // -------- Lamination Calculation Function --------
                    function getLamiWeight(comp, val, size, cut, group) {
                        val = parseFloat(val) || 0;
                        size = parseFloat(size) || 0;
                        cut = parseFloat(cut) || 0;

                        switch (comp) {
                            case "BODY":
                            case "INNER BODY":
                                if (group === "U+2") return (val * size * cut) / 10000;
                                if (group === "4PNL") return (val * size * cut * 2) / 10000;
                                if (group === "2PNL") return (val * size * cut * 4) / 10000;
                                if (group === "CIRCULAR") return (val * size * cut * 2) / 10000;
                                return (val * size * cut) / 10000;

                            case "SIDE":
                               
                                 case "INNER SIDE   ":
                           if (group === "U+2") return (val * size * cut * 2) / 10000;
                                if (group === "4PNL") return (val * size * cut * 2) / 10000;
                                if (group === "2PNL") return (val * size * cut * 2) / 10000;
                                if (group === "CIRCULAR") return (val * size * cut * 2) / 10000;
                                return (val * size * cut) / 10000;


                            case "TOP":
                            case "TOP FLAP":
                            case "INNER TOP":
                            case "BOTTOM":
                            case "BOTTOM FLAP":
                            case "INNER BOTTOM":
                            case "F/SKIRT":
                            case "INNER FS":
                            case "DS":
                            case "INNER DS":
                            return (val * size * cut) / 10000;
                        case "SLEEVE":
                        return ((val * size * cut) / 10000) * 4;

                            case "BAFFLE": {
                                let type = document.getElementById("baffle_fabric_type")?.value || "";
                                let construction = document.getElementById("baffle_construction_type")?.value || "";
                                if (type !== "NET") return (val * size * cut / 10000) * 4;
                                if (construction === "CENTER") return (val * size * cut) / 10000;
                                return 0;
                            }

                            case "PATCH": return (val * size * cut) / 10000 * 8;  
                            case "IRIS FABRIC":{   

                            result =  (val * size * cut) / 10000;
                            const dsOption = document.getElementById("hemm_ds_select")?.value || "";
                                const fsOption = document.getElementById("hemm_fs_select")?.value || "";
                                if (dsOption.toUpperCase() === "IRIS" && fsOption.toUpperCase() === "IRIS") {
                                    result = ((val * cut) / 100) * 2;
                                }

                                return result;
                            }
                            case "PETAL COVER": {
                            
                            let col6 = 0;

                            const fsOption = document.getElementById("hemm_fs_select")?.value || "N/A";
                            const dsOption = document.getElementById("hemm_ds_select")?.value || "N/A";

                            if (fsOption !== "N/A" || dsOption !== "N/A") {
                            
                                if (val && size && cut) {
                                    col6 = (val * size * cut) / 10000;
                                    if(fsOption === "PETAL" && dsOption === "PETAL") {
                                    
                                    col6 = col6 * 2;
                                }
                                }

                                
                        }

                        return col6;
                        }


                            default: return 0;
                        }
                    }

                    // -------- Row Loop --------
                    let totalWeight = 0;
                    Array.from(table.rows).forEach(row => {
                        const comp = row.cells[0].textContent.trim().toUpperCase();
                        const gsm = parseFloat(row.cells[2].textContent) || 0;
                        const lamination = parseFloat(row.cells[3].textContent) || 0;
                        const size = parseFloat(row.cells[4].textContent) || 0;
                        const cut = parseFloat(row.cells[5].textContent) || 0;

                        let fabricWeight = Math.round(getFabricWeight(comp, gsm, size, cut, matchedGroup));
                        let lamiWeight = Math.round(getLamiWeight(comp, lamination, size, cut, matchedGroup));
                        let total = fabricWeight + lamiWeight;

                        row.cells[6].textContent = fabricWeight;
                        row.cells[7].textContent = lamiWeight;
                        row.cells[8].textContent = total;

                        totalWeight += total;
                    });

                    const totalWeightDisplay = document.getElementById('totalWeightDisplay');
                    if (totalWeightDisplay) totalWeightDisplay.textContent = Math.round(totalWeight);
                }


            function setupCalculationTriggers() {
                const inputs = [
                    'size_l_box', 'size_W_box', 'size_H_box', 'bag_type', 'sf', 'swl',
                    'l_int_type', 'h_unit', 'UN_checkbox', 'short_length_loop_box',
                    'long_length_loop_box', 'fs_rope', 'skirt_box', 'skirt_box_rope',
                    'f_s_size_D_box', 'f_s_size_H_box', 'ds_rope', 'ds_size_D_box',
                    'ds_size_H_box', 'hemm_fs_select', 'hemm_fs_rope', 'hemm_ds_select',
                    'hemm_ds_rope', 'hygiene', 'topFlap', 'bottomFlap', 'baffle_construction_type',
                    'baffle_fabric_type', 'liner_design_box', 'liner_microns_box', 'attachment'
                ];

                inputs.forEach(id => {
                    const element = document.getElementById(id);
                    if (element) {
                        element.addEventListener('change', calculateAllWeights);
                        element.addEventListener('input', calculateAllWeights);
                    }
                });

                // Also recalculate when table cells are edited
                const table = document.querySelector('#dataGridView1 tbody');
                if (table) {
                    table.addEventListener('input', function(e) {
                        if (e.target.matches('td[contenteditable="true"]')) {
                            calculateAllWeights();
                        }
                    });
                }
            }

            function loop_cover_form() {
               ("=== loop_cover_form called ===");

                try {
                     clearAllLoopCoverRows();
                    let loopCover = document.getElementById("loop_cover")?.value?.toUpperCase() || "";
                    let constructionType = document.getElementById("bag_type")?.value?.toUpperCase() || "";
                    let loop_free_h_value = parseFloat(document.getElementById('loop_fh')?.value) || 0;

                    if (unit === 'inch') {
                            loop_free_h_value = loop_free_h_value * 2.54;
                            
                        }

                   ("loopCover:", loopCover, "constructionType:", constructionType, "loop_free_h_value:", loop_free_h_value);

                    function setCell(row, col, val) {
                        let table = document.getElementById("dataGridView1");
                        if (table && table.rows[row] && table.rows[row].cells[col]) {
                           (`Setting cell [${row}, ${col}] = ${val}`);
                            table.rows[row].cells[col].innerText = val ?? 0;
                        } else {
                            console.warn(`Cell [${row}, ${col}] not found!`);
                        }
                    }

                    function getCell(row, col) {
                        let table = document.getElementById("dataGridView1");
                        if (table && table.rows[row] && table.rows[row].cells[col]) {
                            let txt = table.rows[row].cells[col].innerText.trim();
                            return txt === "" ? 0 : txt;
                        }
                        console.warn(`Cell [${row}, ${col}] not found for getCell!`);
                        return 0;
                    }

                    // function resetRow(row) {
                    //     for (let c = 2; c <= 5; c++) {
                    //         setCell(row, c, 0);
                    //     }
                    // }

                    // ---- MAIN CONDITIONS ----
                    if (loopCover === "SINGLE" || loopCover === "DOUBLE") {
                        if (["SINGLE LOOP","DOUBLE LOOP","SINGLE LOOP STD","DOUBLE_LOOP_STD","SINGLE LOOP WITH STAR BOTTOM","SINGLE LOOP WITH CORNER LOOP"].includes(constructionType)) {
                            setCell(16, 2, 90);
                            setCell(16, 3, 20);
                            setCell(16, 4, 20);
                            setCell(16, 5, 40);
                            setCell(16, 11, "");
                            calculateAllWeights();
                        }
                    

                    } else if (loopCover === "WEAR_PAD") {
                        setCell(16, 2, getCell(15, 2));
                        setCell(16, 3, getCell(15, 3));
                        setCell(16, 4, getCell(15, 4));
                        setCell(16, 5, (loop_free_h_value * 2));
                        setCell(16, 13, "WEAR PAD");
                        calculateAllWeights();

                    

                    } else if (loopCover === "SLEEVE") {
                        if (!["SINGLE LOOP","DOUBLE LOOP","SINGLE LOOP STD","DOUBLE_LOOP_STD","SINGLE LOOP WITH STAR BOTTOM","SINGLE LOOP WITH CORNER LOOP"].includes(constructionType)) {
                            setCell(19, 2, 90);
                            setCell(19, 3, 20);

                            let aa = getCell(15, 4).toString();
                            let aba = aa.slice(0, -2);
                            setCell(19, 4, Math.round((parseFloat(aba) * 3) / 10));
                            setCell(19, 5, Math.round((loop_free_h_value * 2) - 2));
                            calculateAllWeights();
                        
                        } else {
                            setCell(19, 2, 90);
                            setCell(19, 3, 20);
                            setCell(19, 4, 30);
                            setCell(19, 5, 35);
                            
                        }

                    

                    } 

                   ("=== loop_cover_form finished ===");

                } catch (err) {
                    ("Error in loop_cover_form:", err);
                }
            } 

            function clearAllLoopCoverRows() {
                let table = document.getElementById("dataGridView1");
                if (!table) return;

                // clear rows 16 (WEAR_PAD) and 19 (SLEEVE) 
                [16, 19].forEach(row => {
                    if (table.rows[row]) {
                        for (let c = 2; c <= 13; c++) { // adjust columns as needed
                            table.rows[row].cells[c].innerText = "0";
                        }
                    }
                });
            }

            function thread_for_all() {
                try {
                    const table = document.querySelector('#dataGridView1 tbody');
                    if (!table) return;
                    
                    const rows = table.rows;
                    const stitching = document.getElementById("stitcing")?.value ;
                    const constructionType = document.getElementById("bag_type")?.value || "";
                    const skirtValue = parseFloat(document.getElementById("skirt_box")?.value) || 0;
                    const fsd = parseFloat(document.getElementById("f_s_size_D_box")?.value) || 0;
                    const fsh = parseFloat(document.getElementById("f_s_size_H_box")?.value) || 0;
                    const dsd = parseFloat(document.getElementById("ds_size_D_box")?.value) || 0;
                    const dsh = parseFloat(document.getElementById("ds_size_H_box")?.value) || 0;
                    const dustProofing = document.getElementById("dust_proofing")?.value || "N/A";
                    const sizeH = parseFloat(document.getElementById("size_H_box")?.value) || 0;
                    const sizeL = parseFloat(document.getElementById("size_l_box")?.value) || 0;
                    const sizeW = parseFloat(document.getElementById("size_W_box")?.value) || 0;
                    const topFlapChecked = document.getElementById("topFlap")?.checked || false;
                    const bottomFlapChecked = document.getElementById("bottomFlap")?.checked || false;
                    
                    // Helper functions
                    const getCellValue = (rowIndex, colIndex) => {
                        const cell = rows[rowIndex]?.cells[colIndex];
                        return cell ? parseFloat(cell.textContent.trim()) || 0 : 0;
                    };
                    
                    const setCellValue = (rowIndex, colIndex, value) => {
                        if (rows[rowIndex] && rows[rowIndex].cells[colIndex]) {
                            rows[rowIndex].cells[colIndex].textContent = value;
                        }
                    };
                    
                    // Reset all thread values first
                    for (let i = 0; i < rows.length; i++) {
                        setCellValue(i, 9, "0");
                    }
                    
                    if (stitching === "Overlock_Chain") {
                       
                        if (getCellValue(0, 8) > 0 && getCellValue(0, 5) > 0) {
                            setCellValue(0, 9, ((getCellValue(0, 5) * 2) / 100 * 6.2).toFixed(2));
                        }
                        
                        if (getCellValue(0, 8) > 0 && 
                            ["DOUBLE LOOP", "SINGLE LOOP", "CIRCULAR CC", "CIRCULAR CC BFL"].includes(constructionType)) {
                            setCellValue(0, 9, "0");
                        }
                        
                       
                        if (["4 PNL BFL CC", "4 PNL BFL CNR", "4 PNL CNR", "4 PNL CC"].includes(constructionType)) {
                            if (getCellValue(2, 8) > 0 && getCellValue(2, 5) > 0) {
                                setCellValue(2, 9, ((getCellValue(2, 5) * 2) / 100 * 6.2).toFixed(2));
                            }

                            if (getCellValue(6, 8) > 0 && getCellValue(6, 5) > 0) {
                                setCellValue(6, 9, ((getCellValue(6, 5) * 4) / 100 * 6.2).toFixed(2));
                            }
                            
                        }
                        
                       
                        if (getCellValue(4, 8) > 0) {
                            if (getCellValue(4, 5) > 0 && getCellValue(4, 4) > 0) {
                                setCellValue(4, 9, (((getCellValue(4, 5) + getCellValue(4, 4)) * 2) / 100 * 2.2).toFixed(2));
                            }
                        } else {
                            if (getCellValue(8, 8) > 0) {
                                if (constructionType !== "CIRCULAR CC" && constructionType !== "CIRCULAR CC BFL") {
                                    if (getCellValue(0, 4) > 0 && getCellValue(2, 4) > 0) {
                                        setCellValue(4, 9, (((getCellValue(0, 4) + getCellValue(2, 4)) * 2 / 100) * 2.2).toFixed(2));
                                    }
                                } else {
                                    if (getCellValue(0, 4) > 0) {
                                        setCellValue(4, 9, ((getCellValue(0, 4) * 2) / 100 * 2.2).toFixed(2));
                                    }
                                }
                            }
                        }
                        
                      
                        if (topFlapChecked && getCellValue(5, 8) > 0 && getCellValue(5, 4) > 0) {
                            setCellValue(5, 9, (getCellValue(5, 4) / 100 * 4.4).toFixed(2));
                        }
                        
                      
                        if (getCellValue(6, 8) > 0 && getCellValue(6, 4) > 0 && getCellValue(6, 3) > 0) {
                            setCellValue(6, 9, (((getCellValue(6, 4) + getCellValue(6, 3)) * 2) / 100 * 6.2).toFixed(2));
                        }
                        
                      
                        if (bottomFlapChecked && getCellValue(7, 8) > 0 && getCellValue(7, 4) > 0) {
                            setCellValue(7, 9, (getCellValue(7, 4) / 100 * 4.4).toFixed(2));
                        }
                        
                      
                        setCellValue(8, 9, "10");
                        
                        if (getCellValue(8, 8) > 0 && getCellValue(8, 4) > 0 && getCellValue(8, 5) > 0) {
                            setCellValue(8, 9, ((getCellValue(8, 4) + getCellValue(8, 5)) / 100 * 4.4).toFixed(2));
                        }
                        
                        if (skirtValue > 0 && getCellValue(8, 5) > 0) {
                            setCellValue(8, 9, ((getCellValue(8, 5) * 4.4) / 100).toFixed(2));
                        }
                        
                        // Row 11 (DS)
                        if (getCellValue(11, 8) > 0 && getCellValue(11, 4) > 0 && getCellValue(11, 5) > 0) {
                            setCellValue(11, 9, ((getCellValue(11, 4) + getCellValue(11, 5)) / 100 * 4.4).toFixed(2));
                        }
                        
                        //Row 14 (LOOP)
                        if (getCellValue(14, 8) > 0) {
                            setCellValue(14, 9, ((sizeH * 70 / 100) * 4 / 100 * 2.2).toFixed(2));
                        }
                        
                        // Row 15 (LOOP 2 )
                        if (getCellValue(15, 8) > 0 && getCellValue(15, 5) > 0) {
                            setCellValue(15, 9, (getCellValue(15, 5) * 4 / 100 * 4.4).toFixed(2));
                        }
                        
                       
                        if (getCellValue(16, 8) > 0 && getCellValue(16, 5) > 0) {
                            setCellValue(16, 9, ((getCellValue(16, 4) * 4.4 / 100) * 4).toFixed(2));
                        }
                        
                        // Row 17 (RING LOOP)
                        if (getCellValue(17, 8) > 0) {
                            setCellValue(17, 9, ((sizeW * 4 / 100) * 4.4).toFixed(2));
                        }
                        
                        // Row 18 (STEVEDORE)
                        if (getCellValue(18, 8) > 0) {
                            let threadValue = ((sizeL + sizeW) * 2 / 100 * 2.2);
                            if (constructionType === "DOUBLE LOOP") {
                                threadValue *= 2;
                            }
                            setCellValue(18, 9, threadValue.toFixed(2));
                        }
                        
                        // Row 19 (SLEEVE - second)
                        if (getCellValue(19, 8) > 0) {
                            setCellValue(19, 9, ((sizeL + sizeW) * 2 / 100 * 2.2).toFixed(2));
                        }
                        
                        // Row 20 (TOP BAND)
                        if (getCellValue(20, 8) > 0) {
                            setCellValue(20, 9, ((sizeL + sizeW) * 2 / 100 * 4.4).toFixed(2));
                        }
                         // Row 20 (TOP BAND)
                       if (getCellValue(21, 8) > 0) {
                           setCellValue(21, 9, ((sizeW * 4 / 100) * 4.4).toFixed(2));
                        }
                        // Row 23 (PATCH)
                        if (getCellValue(23, 8) > 0 && getCellValue(23, 5) > 0) {
                            setCellValue(23, 9, (getCellValue(23, 5) * 2.2 / 100).toFixed(2));
                        }
                        
                        // Row 31 (BAFFLE)
                        const baffleTypes = ["2 PNL BFL CC", "4 PNL BFL CC", "4 PNL BFL CNR", "CIRCULAR CC BFL", 
                                            "PINCH CORNER BAFFLE", "U+2 BAFFLE", "U+2 CC BAFFLE"];
                        const u2BaffleTypes = ["U+2 BAFFLE", "U+2 CC BAFFLE"];
                        
                        if (baffleTypes.includes(constructionType) && getCellValue(31, 8) > 0) {
                            let threadValue = 0;
                          const hasDustProofing = (document.getElementById("dust_proofing")?.value || "N/A") !== "N/A";
       
                           if (
                                        hasDustProofing &&
                                        (constructionType === "U+2 BAFFLE" || constructionType === "U+2 CC BAFFLE")
                                    ) {
                              
                                const factor = hasDustProofing ? 2.2 : 4.4;
                               
                                        if (getCellValue(0, 5) > 0 && getCellValue(2, 5) > 0) {
                                            const bodycut = (getCellValue(0, 5) * 2 / 100) * factor;
                                            const sidecut = (getCellValue(2, 5) * 4 / 100) * factor;
                                            threadValue = bodycut + sidecut;
                                        }
                            }
                                else {
                                   
                                    const factor = hasDustProofing ? 2.2 : 4.4;
                                
                                if (getCellValue(0, 5) > 0) {
                                    threadValue = (getCellValue(0, 5) * 8 / 100) * factor;
                                }
                            }
                            
                            setCellValue(31, 9, threadValue.toFixed(2));
                        }
                        
                    } else if (stitching === "Double_Chain") {
                        // Row 0 (BODY)
                        if (getCellValue(0, 8) > 0 && getCellValue(0, 5) > 0) {
                            setCellValue(0, 9, ((getCellValue(0, 5) * 2) / 100 * 4.4).toFixed(2));
                        }
                        
                        if (getCellValue(0, 8) > 0 && 
                            ["DOUBLE LOOP", "SINGLE LOOP", "CIRCULAR CC", "CIRCULAR CC BFL"].includes(constructionType)) {
                            setCellValue(0, 9, "0");
                        }
                        
                        // Row 2 (SIDE)
                        if (["4 PNL BFL CC", "4 PNL BFL CNR", "4 PNL CNR", "4 PNL CC"].includes(constructionType)) {
                            if (getCellValue(2, 8) > 0 && getCellValue(2, 5) > 0) {
                                setCellValue(2, 9, ((getCellValue(2, 5) * 2) / 100 * 4.4).toFixed(2));
                            }
                        }
                        
                        // Row 4 (TOP) - Double_Chain version
                        if (getCellValue(4, 8) > 0 && getCellValue(4, 5) > 0 && getCellValue(4, 4) > 0) {
                            setCellValue(4, 9, (((getCellValue(4, 4) + getCellValue(4, 5)) * 2) / 100 * 2.2).toFixed(2));
                        } else if (getCellValue(8, 8) > 0) {
                            if (!["CIRCULAR CC", "CIRCULAR CC BFL"].includes(constructionType)) {
                                if (getCellValue(0, 4) > 0 && getCellValue(2, 4) > 0) {
                                    setCellValue(4, 9, (((getCellValue(0, 4) + getCellValue(2, 4)) * 2) / 100 * 2.2).toFixed(2));
                                }
                            } else {
                                if (getCellValue(0, 4) > 0) {
                                    setCellValue(4, 9, ((getCellValue(0, 4) * 2) / 100 * 2.2).toFixed(2));
                                }
                            }
                        }
                        
                        // Row 5 (INNER TOP)
                        if (topFlapChecked && getCellValue(5, 8) > 0 && getCellValue(5, 4) > 0) {
                            setCellValue(5, 9, (getCellValue(5, 4) / 100 * 4.4).toFixed(2));
                        }
                        
                        // Row 6 (BOTTOM)
                        if (getCellValue(6, 8) > 0 && getCellValue(6, 5) > 0 && getCellValue(6, 4) > 0) {
                            setCellValue(6, 9, (((getCellValue(6, 5) + getCellValue(6, 4)) * 2) / 100 * 4.4).toFixed(2));
                        }
                        
                        // Row 7 (INNER BOTTOM)
                        if (bottomFlapChecked && getCellValue(7, 8) > 0 && getCellValue(7, 4) > 0) {
                            setCellValue(7, 9, (getCellValue(7, 4) / 100 * 4.4).toFixed(2));
                        }
                        
                        // Row 8 (F/SKIRT)
                        setCellValue(8, 9, "10");
                        
                        if (getCellValue(8, 8) > 0 && getCellValue(8, 5) > 0 && getCellValue(8, 4) > 0) {
                            setCellValue(8, 9, ((getCellValue(8, 5) + getCellValue(8,4)) / 100 * 4.4).toFixed(2));
                        }
                        
                        if (skirtValue > 0 && getCellValue(8, 5) > 0) {
                            setCellValue(8, 9, ((getCellValue(8, 5) * 4.4) / 100).toFixed(2));
                        }
                        
                        // Row 11 (DS)
                        if (getCellValue(11, 8) > 0 && getCellValue(11, 4) > 0 && getCellValue(11, 5) > 0) {
                            setCellValue(11, 9, ((getCellValue(11, 4) + getCellValue(11, 5)) / 100 * 4.4).toFixed(2));
                        }
                        
                        // Row 14 (SLEEVE)
                        if (getCellValue(14, 8) > 0) {
                            setCellValue(14, 9, ((sizeH * 70 / 100) * 4 / 100 * 2.2).toFixed(2));
                        }
                        
                        // Row 15 (LOOP)
                        if (getCellValue(15, 8) > 0 && getCellValue(15, 5) > 0) {
                            setCellValue(15, 9, (getCellValue(15, 5) * 4 / 100 * 4.4).toFixed(2));
                        }
                        
                        // Row 16 (LOOP 2)
                        if (getCellValue(16, 8) > 0 && getCellValue(16, 5) > 0) {
                            setCellValue(16, 9, ((getCellValue(16, 5) * 4.4 / 100) * 4).toFixed(2));
                        }
                        
                        // Row 17 (RING LOOP)
                        if (getCellValue(17, 8) > 0) {
                            setCellValue(17, 9, ((sizeW * 4 / 100) * 4.4).toFixed(2));
                        }
                        
                        // Row 18 (STEVEDORE)
                        if (getCellValue(18, 8) > 0) {
                            setCellValue(18, 9, ((sizeL + sizeW) * 2 / 100 * 2.2).toFixed(2));
                        }
                        
                        // Row 19 (SLEEVE - second)
                        if (getCellValue(19, 8) > 0) {
                            setCellValue(19, 9, ((sizeL + sizeW) * 2 / 100 * 2.2).toFixed(2));
                        }
                        
                        // Row 20 (TOP BAND)
                        if (getCellValue(20, 8) > 0) {
                            setCellValue(20, 9, ((sizeL + sizeW) * 2 / 100 * 4.4).toFixed(2));
                        }
                         if (getCellValue(21, 8) > 0) {
                            setCellValue(21, 9, ((sizeL + sizeW) * 2 / 100 * 4.4).toFixed(2));
                        }


                        
                        // Row 23 (PATCH)
                        if (getCellValue(23, 8) > 0 && getCellValue(23, 4) > 0) {
                            setCellValue(23, 9, (getCellValue(23, 4) * 2.2 / 100).toFixed(2));
                        }
                        
                        // BAFFLE calculation for Double_Chain
                        const baffleTypes = ["2 PNL BFL CC", "4 PNL BFL CC", "4 PNL BFL CNR", "CIRCULAR CC BFL", 
                                            "PINCH CORNER BAFFLE", "U+2 BAFFLE"];
                        
                        if (baffleTypes.includes(constructionType) && getCellValue(31, 8) > 0) {
                            let threadValue = 0;
                          const hasDustProofing = (document.getElementById("dust_proofing")?.value || "N/A") !== "N/A";
       
                           if (
                                        hasDustProofing &&
                                        (constructionType === "U+2 BAFFLE" || constructionType === "U+2 CC BAFFLE")
                                    ) {
                              
                                const factor = hasDustProofing ? 2.2 : 4.4;
                               
                                        if (getCellValue(0, 5) > 0 && getCellValue(2, 5) > 0) {
                                            const bodycut = (getCellValue(0, 5) * 2 / 100) * factor;
                                            const sidecut = (getCellValue(2, 5) * 4 / 100) * factor;
                                            threadValue = bodycut + sidecut;
                                        }
                            }
                                else {
                                   
                                    const factor = hasDustProofing ? 2.2 : 4.4;
                                
                                if (getCellValue(0, 5) > 0) {
                                    threadValue = (getCellValue(0, 5) * 8 / 100) * factor;
                                }
                            }
                            
                            setCellValue(31, 9, threadValue.toFixed(2));
                        }
                    }



                      
                        // setCellValue(0, 9, ((sizeH * 4 + sizeW * 2 + sizeL * 4) * 0.055).toFixed(2));
                        
                        
                        // if (skirtValue > 0 && getCellValue(8, 5) > 0) {
                        //     setCellValue(8, 9, ((skirtValue * 0.055) /2).toFixed(2));
                        // }

                        // setCellValue(8, 9, ((fsd * 3.14 + fsh ) * 0.055 /2).toFixed(2));
                          
                       
                        // setCellValue(11, 9, ((dsd * 3.14 + dsh ) * 0.055 /2).toFixed(2));


                     
                        // setCellValue(14, 9, ((sizeH * 70 / 100) * 4 / 100 * 2.2).toFixed(2));
                       
                        


                    
                } catch (err) {
                    ("Error in thread_for_all:", err);
                }
            }
           
            function box_to_grid() {
                try {


                const table = document.getElementById("dataGridView1");

                        if (table && table.rows[1]) {

                            const row2 = table.rows[1];
                            const gsmCell = row2.cells[2];
                            const lamCell = row2.cells[3];

                            const BODY_GSM_INPUT = document.querySelector('input[name="body_gsm"]');

                            if (BODY_GSM_INPUT && BODY_GSM_INPUT.value.trim() !== "") {

                                let val = BODY_GSM_INPUT.value.trim();

                                // Normalize special plus signs
                                val = val.replace(/ï¼‹|ï¹¢|á©/g, "+");

                                const parts = val.split("+");

                                const gsm = parts[0] || "0";
                                const lam = parts[1] || "0";

                                // GSM + Lam update
                                gsmCell.innerText = gsm;
                                lamCell.innerText = val.includes("+") ? lam : "0";

                                // â­ NOW UPDATE CUT SIZE (CELL 5) AFTER GSM UPDATE â­
                                let oldCut = parseFloat(row2.cells[5].innerText.trim()) || 0;
                                let newCut = oldCut - 7;

                                row2.cells[5].innerText = newCut;
                            }
                        }



                } catch (e) {
                        ("Error in BODY GSM:", e);
                }

                try {
                // SIDE GSM - CORRECTED
                const table = document.getElementById("dataGridView1");

                if (table && table.rows[3]) {

                    const row2 = table.rows[3];
                    const gsmCell = row2.cells[2];
                    const lamCell = row2.cells[3];

                    const SIDE_GSM_INPUT = document.querySelector('input[name="side_gsm"]');
                    if (SIDE_GSM_INPUT && SIDE_GSM_INPUT.value.trim() !== "") {

                        let val = SIDE_GSM_INPUT.value.trim();

                    
                        val = val.replace(/ï¼‹|ï¹¢|á©/g, "+");

                        const parts = val.split("+");

                        const gsm = parts[0] || "0";
                        const lam = parts[1] || "0";

                        // GSM + Lam update
                        gsmCell.innerText = gsm;
                        lamCell.innerText = val.includes("+") ? lam : "0";

                    
                        let oldCut = parseFloat(row2.cells[5].innerText.trim()) || 0;
                        let newCut = oldCut - 3;

                        row2.cells[5].innerText = newCut;
                    }
                }

                    } catch (e) {
                        ("Error in SIDE GSM:", e);
                    }


                try {
                    const fsGsmInput = document.querySelector('input[name="top_gsm"]');
                    if (fsGsmInput && fsGsmInput.value.trim() !== "") {
                        const val = fsGsmInput.value.trim().replace(/ï¼‹|ï¹¢|á©/g, "+");
                        const parts = val.split("+");
                        const gsm = parts[0].trim() || "0";
                        const lam = parts[1]?.trim() || "0";

                    
                        const fsRow = Array.from(document.querySelectorAll("#dataGridView1 tbody tr"))
                            .find(r => r.cells[0]?.innerText.trim().toUpperCase() === "TOP");
                        if (fsRow) {
                            fsRow.cells[2].innerText = gsm;
                            fsRow.cells[3].innerText = lam;
                        
                        
                        }
                    }
                } catch (e) { console.error("FS GSM Error:", e); }

                try {
                    const fsGsmInput = document.querySelector('input[name="bottom_gsm"]');
                    if (fsGsmInput && fsGsmInput.value.trim() !== "") {
                        const val = fsGsmInput.value.trim().replace(/ï¼‹|ï¹¢|á©/g, "+");
                        const parts = val.split("+");
                        const gsm = parts[0].trim() || "0";
                        const lam = parts[1]?.trim() || "0";

                    
                        const fsRow = Array.from(document.querySelectorAll("#dataGridView1 tbody tr"))
                            .find(r => r.cells[0]?.innerText.trim().toUpperCase() === "BOTTOM");
                        if (fsRow) {
                            fsRow.cells[2].innerText = gsm;
                            fsRow.cells[3].innerText = lam;
                        
                        
                        }
                    }
                } catch (e) { console.error("FS GSM Error:", e); }

                try {
                    const fsGsmInput = document.querySelector('input[name="fs_gsm"]');
                    if (fsGsmInput && fsGsmInput.value.trim() !== "") {
                        const val = fsGsmInput.value.trim().replace(/ï¼‹|ï¹¢|á©/g, "+");
                        const parts = val.split("+");
                        const gsm = parts[0].trim() || "0";
                        const lam = parts[1]?.trim() || "0";

                    
                        const fsRow = Array.from(document.querySelectorAll("#dataGridView1 tbody tr"))
                            .find(r => r.cells[0]?.innerText.trim().toUpperCase() === "F/SKIRT");
                        if (fsRow) {
                            fsRow.cells[2].innerText = gsm;
                            fsRow.cells[3].innerText = lam;
                        
                        
                        }
                    }
                } catch (e) { console.error("FS GSM Error:", e); }

                // FS GSM
                try {
                    const fsGsmInput = document.querySelector('input[name="ds_gsm"]');
                    if (fsGsmInput && fsGsmInput.value.trim() !== "") {
                        const val = fsGsmInput.value.trim().replace(/ï¼‹|ï¹¢|á©/g, "+");
                        const parts = val.split("+");
                        const gsm = parts[0].trim() || "0";
                        const lam = parts[1]?.trim() || "0";

                    
                        const fsRow = Array.from(document.querySelectorAll("#dataGridView1 tbody tr"))
                            .find(r => r.cells[0]?.innerText.trim().toUpperCase() === "DS");
                        if (fsRow) {
                            fsRow.cells[2].innerText = gsm;
                            fsRow.cells[3].innerText = lam;
                        
                        
                        }
                    }

                } catch (e) { console.error("FS GSM Error:", e); }


                try {
                    const fsGsmInput = document.querySelector('input[name="baffle_gsm"]');
                    if (fsGsmInput && fsGsmInput.value.trim() !== "") {
                        const val = fsGsmInput.value.trim().replace(/ï¼‹|ï¹¢|á©/g, "+");
                        const parts = val.split("+");
                        const gsm = parts[0].trim() || "0";
                        const lam = parts[1]?.trim() || "0";

                    
                        const fsRow = Array.from(document.querySelectorAll("#dataGridView1 tbody tr"))
                            .find(r => r.cells[0]?.innerText.trim().toUpperCase() === "BAFFLE");
                        if (fsRow) {
                            fsRow.cells[2].innerText = gsm;
                            // fsRow.cells[3].innerText = lam;
                        
                        
                        }
                    }
                } catch (e) { 
                        ("Error in BAFFLE GSM:", e);
                    }

                /////////////////double layer//////// - CORRECTED
                try {
                    const table = document.getElementById('dataGridView1');
                    const rows = table.rows;
                    
                    // Remove existing inner layers
                    for (let i = rows.length - 1; i >= 0; i--) {
                        const cellValue = rows[i].cells[0]?.innerText.trim().toUpperCase();
                        if (cellValue === "INNER BODY" || cellValue === "INNER SIDE" || 
                            cellValue === "INNER TOP" || cellValue === "INNER BOTTOM" || 
                            cellValue === "INNER FS" || cellValue === "INNER DS") {
                            table.deleteRow(i);
                        }
                    }
                } catch (e) { 
                    ("Error removing inner layers:", e);
                }

                try {
                    const table = document.getElementById('dataGridView1');
                    const tbody = table.getElementsByTagName('tbody')[0];
                    
                    for (let i = 0; i < table.rows.length; i++) {
                        const row = table.rows[i];
                        const cellValue = row.cells[0]?.innerText.trim().toUpperCase();
                        const mainValue = row.cells[2]?.innerText; // GSM is in column 2
                        
                        if (!mainValue || mainValue.trim() === "" || mainValue.trim() === "0" || parseFloat(mainValue) <= 0) {
                            continue;
                        }

                        if (cellValue === "BODY") {
                            const DOUBLE_BODY_BOX = document.getElementById('bodyDouble');
                            if (DOUBLE_BODY_BOX && DOUBLE_BODY_BOX.checked) {
                                const inner_body_gsm = document.querySelector('input[name="body_double_value"]');
                                if (inner_body_gsm && inner_body_gsm.value.trim() !== "") {
                                    try {
                                        const newRow = tbody.insertRow();
                                        // Add all 17 columns for consistency
                                        newRow.innerHTML = `
                                            <td>INNER BODY</td>
                                            <td></td> <!-- COLOR -->
                                            <td>${inner_body_gsm.value.split('+')[0] || '0'}</td> <!-- GSM -->
                                            <td>${inner_body_gsm.value.split('+')[1] || '0'}</td> <!-- LAMINATION -->
                                            <td>${row.cells[4]?.innerText || '0'}</td> <!-- FABRIC SIZE -->
                                            <td>${row.cells[5]?.innerText || '0'}</td> <!-- CUT SIZE -->
                                            <td>0</td> <!-- FABRIC WEIGHT -->
                                            <td>0</td> <!-- LAMI WEIGHT -->
                                            <td>0</td> <!-- TOTAL -->
                                            <td>0</td> <!-- THREAD -->
                                            <td>0</td> <!-- HEMMING -->
                                            <td>0</td> <!-- DUST PROOF -->
                                            <td>0</td> <!-- FELT -->
                                            <td>0</td> <!-- MARKETING REMARKS -->
                                            <td>0</td> <!-- SYSTEM REMARKS -->
                                            <td>0</td> <!-- TYPE-C -->
                                            <td>0</td> <!-- TYPE-D -->
                                        `;
                                    } catch (e) {
                                        ("Error adding INNER BODY:", e);
                                        const newRow = tbody.insertRow();
                                        newRow.innerHTML = `
                                            <td>INNER BODY</td>
                                            <td></td>
                                            <td>${inner_body_gsm.value.split('+')[0] || '0'}</td>
                                            <td>0</td>
                                            <td>${row.cells[4]?.innerText || '0'}</td>
                                            <td>${row.cells[5]?.innerText || '0'}</td>
                                            <td>0</td><td>0</td><td>0</td><td>0</td>
                                            <td>0</td><td>0</td><td>0</td><td>0</td>
                                            <td>0</td><td>0</td><td>0</td>
                                        `;
                                    }
                                }
                            }
                        }
                        else if (cellValue === "SIDE") {
                            const DOUBLE_SIDE_BOX = document.getElementById('sideDouble');
                            if (DOUBLE_SIDE_BOX && DOUBLE_SIDE_BOX.checked) {
                                const inner_side_gsm = document.querySelector('input[name="side_double_value"]');
                                if (inner_side_gsm && inner_side_gsm.value.trim() !== "") {
                                    try {
                                        const newRow = tbody.insertRow();
                                        newRow.innerHTML = `
                                            <td>INNER SIDE</td>
                                            <td></td>
                                            <td>${inner_side_gsm.value.split('+')[0] || '0'}</td>
                                            <td>${inner_side_gsm.value.split('+')[1] || '0'}</td>
                                            <td>${row.cells[4]?.innerText || '0'}</td>
                                            <td>${row.cells[5]?.innerText || '0'}</td>
                                            <td>0</td><td>0</td><td>0</td><td>0</td>
                                            <td>0</td><td>0</td><td>0</td><td>0</td>
                                            <td>0</td><td>0</td><td>0</td>
                                        `;
                                    } catch (e) {
                                        ("Error adding INNER SIDE:", e);
                                        const newRow = tbody.insertRow();
                                        newRow.innerHTML = `
                                            <td>INNER SIDE</td>
                                            <td></td>
                                            <td>${inner_side_gsm.value.split('+')[0] || '0'}</td>
                                            <td>0</td>
                                            <td>${row.cells[4]?.innerText || '0'}</td>
                                            <td>${row.cells[5]?.innerText || '0'}</td>
                                            <td>0</td><td>0</td><td>0</td><td>0</td>
                                            <td>0</td><td>0</td><td>0</td><td>0</td>
                                            <td>0</td><td>0</td><td>0</td>
                                        `;
                                    }
                                }
                            }
                        }
                        else if (cellValue === "TOP") {
                            const DOUBLE_TOP_BOX = document.getElementById('topDouble');
                            if (DOUBLE_TOP_BOX && DOUBLE_TOP_BOX.checked) {
                                const inner_top_gsm = document.querySelector('input[name="top_double_value"]');
                                if (inner_top_gsm && inner_top_gsm.value.trim() !== "") {
                                    try {
                                        const newRow = tbody.insertRow();
                                        const val = inner_top_gsm.value.trim().replace(/ï¼‹|ï¹¢|á©/g, "+");
                                        const parts = val.split("+");
                                        
                                        newRow.innerHTML = `
                                            <td>INNER TOP</td>
                                            <td></td>
                                            <td>${parts[0] || '0'}</td>
                                            <td>${parts[1] || '0'}</td>
                                            <td>${row.cells[4]?.innerText || '0'}</td>
                                            <td>${row.cells[5]?.innerText || '0'}</td>
                                            <td>0</td><td>0</td><td>0</td><td>0</td>
                                            <td>0</td><td>0</td><td>0</td><td>0</td>
                                            <td>0</td><td>0</td><td>0</td>
                                        `;
                                    } catch (e) {
                                        console.error("Error adding INNER TOP:", e);
                                        const newRow = tbody.insertRow();
                                        const parts = inner_top_gsm.value.split('+');
                                        newRow.innerHTML = `
                                            <td>INNER TOP</td>
                                            <td></td>
                                            <td>${parts[0] || '0'}</td>
                                            <td>0</td>
                                            <td>${row.cells[4]?.innerText || '0'}</td>
                                            <td>${row.cells[5]?.innerText || '0'}</td>
                                            <td>0</td><td>0</td><td>0</td><td>0</td>
                                            <td>0</td><td>0</td><td>0</td><td>0</td>
                                            <td>0</td><td>0</td><td>0</td>
                                        `;
                                    }
                                }
                            }
                        }
                        else if (cellValue === "BOTTOM") {
                            const DOUBLE_BOTTOM_BOX = document.getElementById('bottomDouble');
                            if (DOUBLE_BOTTOM_BOX && DOUBLE_BOTTOM_BOX.checked) {
                                const inner_bottom_gsm = document.querySelector('input[name="bottom_double_value"]');
                                if (inner_bottom_gsm && inner_bottom_gsm.value.trim() !== "") {
                                    try {
                                        const newRow = tbody.insertRow();
                                        const val = inner_bottom_gsm.value.trim().replace(/ï¼‹|ï¹¢|á©/g, "+");
                                        const parts = val.split("+");
                                        
                                        newRow.innerHTML = `
                                            <td>INNER BOTTOM</td>
                                            <td></td>
                                            <td>${parts[0] || '0'}</td>
                                            <td>${parts[1] || '0'}</td>
                                            <td>${row.cells[4]?.innerText || '0'}</td>
                                            <td>${row.cells[5]?.innerText || '0'}</td>
                                            <td>0</td><td>0</td><td>0</td><td>0</td>
                                            <td>0</td><td>0</td><td>0</td><td>0</td>
                                            <td>0</td><td>0</td><td>0</td>
                                        `;
                                    } catch (e) {
                                        console.error("Error adding INNER BOTTOM:", e);
                                        const newRow = tbody.insertRow();
                                        const parts = inner_bottom_gsm.value.split('+');
                                        newRow.innerHTML = `
                                            <td>INNER BOTTOM</td>
                                            <td></td>
                                            <td>${parts[0] || '0'}</td>
                                            <td>0</td>
                                            <td>${row.cells[4]?.innerText || '0'}</td>
                                            <td>${row.cells[5]?.innerText || '0'}</td>
                                            <td>0</td><td>0</td><td>0</td><td>0</td>
                                            <td>0</td><td>0</td><td>0</td><td>0</td>
                                            <td>0</td><td>0</td><td>0</td>
                                        `;
                                    }
                                }
                            }
                        }
                        else if (cellValue === "F/SKIRT") {
                            const DOUBLE_FS_BOX = document.getElementById('fsDouble');
                            if (DOUBLE_FS_BOX && DOUBLE_FS_BOX.checked) {
                                const inner_fs_gsm = document.querySelector('input[name="fs_double_value"]');
                                if (inner_fs_gsm && inner_fs_gsm.value.trim() !== "") {
                                    try {
                                        const newRow = tbody.insertRow();
                                        const val = inner_fs_gsm.value.trim().replace(/ï¼‹|ï¹¢|á©/g, "+");
                                        const parts = val.split("+");
                                        
                                        newRow.innerHTML = `
                                            <td>INNER FS</td>
                                            <td></td>
                                            <td>${parts[0] || '0'}</td>
                                            <td>${parts[1] || '0'}</td>
                                            <td>${row.cells[4]?.innerText || '0'}</td>
                                            <td>${row.cells[5]?.innerText || '0'}</td>
                                            <td>0</td><td>0</td><td>0</td><td>0</td>
                                            <td>0</td><td>0</td><td>0</td><td>0</td>
                                            <td>0</td><td>0</td><td>0</td>
                                        `;
                                    } catch (e) {
                                        console.error("Error adding INNER FS:", e);
                                        const newRow = tbody.insertRow();
                                        const parts = inner_fs_gsm.value.split('+');
                                        newRow.innerHTML = `
                                            <td>INNER FS</td>
                                            <td></td>
                                            <td>${parts[0] || '0'}</td>
                                            <td>0</td>
                                            <td>${row.cells[4]?.innerText || '0'}</td>
                                            <td>${row.cells[5]?.innerText || '0'}</td>
                                            <td>0</td><td>0</td><td>0</td><td>0</td>
                                            <td>0</td><td>0</td><td>0</td><td>0</td>
                                            <td>0</td><td>0</td><td>0</td>
                                        `;
                                    }
                                }
                            }
                        }
                        else if (cellValue === "DS") {
                            const DOUBLE_DS_BOX = document.getElementById('dsDouble');
                            if (DOUBLE_DS_BOX && DOUBLE_DS_BOX.checked) {
                                const inner_ds_gsm = document.querySelector('input[name="ds_double_value"]');
                                if (inner_ds_gsm && inner_ds_gsm.value.trim() !== "") {
                                    try {
                                        const newRow = tbody.insertRow();
                                        const val = inner_ds_gsm.value.trim().replace(/ï¼‹|ï¹¢|á©/g, "+");
                                        const parts = val.split("+");
                                        
                                        newRow.innerHTML = `
                                            <td>INNER DS</td>
                                            <td></td>
                                            <td>${parts[0] || '0'}</td>
                                            <td>${parts[1] || '0'}</td>
                                            <td>${row.cells[4]?.innerText || '0'}</td>
                                            <td>${row.cells[5]?.innerText || '0'}</td>
                                            <td>0</td><td>0</td><td>0</td><td>0</td>
                                            <td>0</td><td>0</td><td>0</td><td>0</td>
                                            <td>0</td><td>0</td><td>0</td>
                                        `;
                                    } catch (e) {
                                        console.error("Error adding INNER DS:", e);
                                        const newRow = tbody.insertRow();
                                        const parts = inner_ds_gsm.value.split('+');
                                        newRow.innerHTML = `
                                            <td>INNER DS</td>
                                            <td></td>
                                            <td>${parts[0] || '0'}</td>
                                            <td>0</td>
                                            <td>${row.cells[4]?.innerText || '0'}</td>
                                            <td>${row.cells[5]?.innerText || '0'}</td>
                                            <td>0</td><td>0</td><td>0</td><td>0</td>
                                            <td>0</td><td>0</td><td>0</td><td>0</td>
                                            <td>0</td><td>0</td><td>0</td>
                                        `;
                                    }
                                }
                            }
                        }
                    
                        
                    }
                    
                    // After adding inner layers, recalculate weights
                    if (typeof calculateAllWeights === 'function') {
                        calculateAllWeights();
                    }
                } catch (e) { 
                    ("Error adding double layers:", e);
                }


            

                updateFlapInputs();

            }


            function updateFlapInputs() {
            const sizeL = document.getElementById('size_l_box');
            const sizeW = document.getElementById('size_W_box');

            const topFlapCheckbox = document.getElementById('topFlap');
            const topL = document.getElementById('top_l');
            const topW = document.getElementById('top_w');

            const bottomFlapCheckbox = document.getElementById('bottomFlap');
            const bottomL = document.getElementById('bottom_l');
            const bottomW = document.getElementById('bottom_w');

            // FLAP TIE row à¤•à¥‹ à¤ªà¤¹à¤²à¥‡ à¤¸à¥‡ à¤¹à¥€ à¤¢à¥‚à¤‚à¤¢ à¤²à¥‡à¤‚
            const flapTieRow = Array.from(document.querySelectorAll("#dataGridView1 tbody tr"))
                .find(r => r.cells[0]?.innerText.trim().toUpperCase() === "FLAP TIE");

            if (topFlapCheckbox && topL && topW) {
                try {
                    if (topFlapCheckbox.checked) {
                        // Set input fields
                        topL.value = sizeL.value || '';
                        topW.value = sizeW.value || '';
                        topL.disabled = false;
                        topW.disabled = false;
                        
                        // Find and update TOP FLAP row in table
                        const topFlapRow = Array.from(document.querySelectorAll("#dataGridView1 tbody tr"))
                            .find(r => r.cells[0]?.innerText.trim().toUpperCase() === "TOP FLAP");
                        
                        // FLAP TIE à¤•à¥‹ à¤…à¤ªà¤¡à¥‡à¤Ÿ à¤•à¤°à¥‡à¤‚ (à¤•à¥‡à¤µà¤² à¤¤à¤­à¥€ à¤œà¤¬ à¤«à¥à¤²à¥ˆà¤ª à¤šà¥‡à¤• à¤¹à¥ˆ)
                        if (flapTieRow) {
                            flapTieRow.cells[2].innerText = 10;  
                            flapTieRow.cells[3].innerText = 'PP/MW';  
                            flapTieRow.cells[4].innerText = '15MM';   
                            flapTieRow.cells[5].innerText = 65;  
                        }
                        
                        if (topFlapRow) {
                            topFlapRow.cells[2].innerText = 70;  
                            topFlapRow.cells[3].innerText = 20;  
                            topFlapRow.cells[4].innerText = Number(topW.value) || 0;   
                            topFlapRow.cells[5].innerText = (Number(topL.value) || 0) + 10;  
                        }
                    } else {
                        // Clear input fields
                        topL.value = '';
                        topW.value = '';
                        topL.disabled = true;
                        topW.disabled = true;
                        
                        // Reset TOP FLAP row in table
                        const topFlapRow = Array.from(document.querySelectorAll("#dataGridView1 tbody tr"))
                            .find(r => r.cells[0]?.innerText.trim().toUpperCase() === "TOP FLAP");
                        
                        if (topFlapRow) {
                            topFlapRow.cells[2].innerText = 0;
                            topFlapRow.cells[3].innerText = 0;
                            topFlapRow.cells[4].innerText = 0;
                            topFlapRow.cells[5].innerText = 0;
                        }
                        
                        // à¤…à¤—à¤° à¤¦à¥‹à¤¨à¥‹à¤‚ à¤«à¥à¤²à¥ˆà¤ª à¤…à¤¨à¤šà¥‡à¤• à¤¹à¥ˆà¤‚, à¤¤à¥‹ FLAP TIE à¤•à¥‹ à¤­à¥€ à¤°à¥€à¤¸à¥‡à¤Ÿ à¤•à¤°à¥‡à¤‚
                        if (!topFlapCheckbox.checked && !bottomFlapCheckbox.checked && flapTieRow) {
                            flapTieRow.cells[2].innerText = 0;
                            flapTieRow.cells[3].innerText = 0;
                            flapTieRow.cells[4].innerText = 0;
                            flapTieRow.cells[5].innerText = 0;
                        }
                    }
                } catch (e) {
                    console.log("Top Flap Error:", e);
                }
            }

            if (bottomFlapCheckbox && bottomL && bottomW) {
                try {
                    if (bottomFlapCheckbox.checked) {
                        // Set input fields
                        bottomL.value = sizeL.value || '';
                        bottomW.value = sizeW.value || '';
                        bottomL.disabled = false;
                        bottomW.disabled = false;
                        
                        // Find and update BOTTOM FLAP row in table
                        const bottomFlapRow = Array.from(document.querySelectorAll("#dataGridView1 tbody tr"))
                            .find(r => r.cells[0]?.innerText.trim().toUpperCase() === "BOTTOM FLAP");
                        
                        // FLAP TIE à¤•à¥‹ à¤…à¤ªà¤¡à¥‡à¤Ÿ à¤•à¤°à¥‡à¤‚ (à¤•à¥‡à¤µà¤² à¤¤à¤­à¥€ à¤œà¤¬ à¤«à¥à¤²à¥ˆà¤ª à¤šà¥‡à¤• à¤¹à¥ˆ)
                        if (flapTieRow && !topFlapCheckbox.checked) {
                            // à¤…à¤—à¤° TOP FLAP à¤šà¥‡à¤• à¤¨à¤¹à¥€à¤‚ à¤¹à¥ˆ, à¤¤à¥‹ BOTTOM FLAP à¤•à¥‡ à¤²à¤¿à¤ FLAP TIE à¤¸à¥‡à¤Ÿ à¤•à¤°à¥‡à¤‚
                             flapTieRow.cells[2].innerText = 10;  
                            flapTieRow.cells[3].innerText = 'PP/MW';  
                            flapTieRow.cells[4].innerText = '15MM';   
                            flapTieRow.cells[5].innerText = 65;  
                        }
                        
                        if (bottomFlapRow) {
                            bottomFlapRow.cells[2].innerText = 70;  // GSM
                            bottomFlapRow.cells[3].innerText = 20;  // LAMINATION
                            bottomFlapRow.cells[4].innerText = Number(bottomW.value) || 0;   // FABRIC SIZE
                            bottomFlapRow.cells[5].innerText = (Number(bottomL.value) || 0) + 10;  // CUT SIZE = L+10
                        }
                    } else {
                        // Clear input fields
                        bottomL.value = '';
                        bottomW.value = '';
                        bottomL.disabled = true;
                        bottomW.disabled = true;
                        
                        // Reset BOTTOM FLAP row in table
                        const bottomFlapRow = Array.from(document.querySelectorAll("#dataGridView1 tbody tr"))
                            .find(r => r.cells[0]?.innerText.trim().toUpperCase() === "BOTTOM FLAP");
                        
                        if (bottomFlapRow) {
                            bottomFlapRow.cells[2].innerText = 0;
                            bottomFlapRow.cells[3].innerText = 0;
                            bottomFlapRow.cells[4].innerText = 0;
                            bottomFlapRow.cells[5].innerText = 0;
                        }
                        
                        // à¤…à¤—à¤° à¤¦à¥‹à¤¨à¥‹à¤‚ à¤«à¥à¤²à¥ˆà¤ª à¤…à¤¨à¤šà¥‡à¤• à¤¹à¥ˆà¤‚, à¤¤à¥‹ FLAP TIE à¤•à¥‹ à¤­à¥€ à¤°à¥€à¤¸à¥‡à¤Ÿ à¤•à¤°à¥‡à¤‚
                        if (!topFlapCheckbox.checked && !bottomFlapCheckbox.checked && flapTieRow) {
                            flapTieRow.cells[2].innerText = 0;
                            flapTieRow.cells[3].innerText = 0;
                            flapTieRow.cells[4].innerText = 0;
                            flapTieRow.cells[5].innerText = 0;
                        }
                    }
                } catch (e) {
                    console.log("Bottom Flap Error:", e);
                }
            }
            
           
                    }

            // function updateFlapTieRopes() {
            //     const topFlapCheckbox = document.getElementById('topFlap');
            //     const bottomFlapCheckbox = document.getElementById('bottomFlap');
            //     const topTieRopeSelect = document.getElementById('no_of_flap_tie_rope_top');
            //     const bottomTieRopeSelect = document.getElementById('no_of_flap_tie_rope_bottom');
            //     const flapTieRow = Array.from(document.querySelectorAll("#dataGridView1 tbody tr"))
            //         .find(r => r.cells[0]?.innerText.trim().toUpperCase() === "FLAP TIE");
                
            //     if (topTieRopeSelect) {
            //         if (topFlapCheckbox && topFlapCheckbox.checked) {
            //             topTieRopeSelect.disabled = false;
                    
            //             if (topTieRopeSelect.options.length > 1) {
            //                 topTieRopeSelect.selectedIndex = 1;
            //             }
            //         } else {
            //             topTieRopeSelect.disabled = true;
            //             topTieRopeSelect.selectedIndex = 0;
            //         }
            //     }
                

            //     if (bottomTieRopeSelect) {
            //         if (bottomFlapCheckbox && bottomFlapCheckbox.checked) {
            //             bottomTieRopeSelect.disabled = false;
                    
            //             if (bottomTieRopeSelect.options.length > 1) {
            //                 bottomTieRopeSelect.selectedIndex = 1;
            //             }
            //         } else {
            //             bottomTieRopeSelect.disabled = true;
            //             bottomTieRopeSelect.selectedIndex = 0;
            //         }
            //     }
                
            
            //     if (flapTieRow && !topFlapCheckbox.checked && !bottomFlapCheckbox.checked) {
            //         flapTieRow.cells[2].innerText = 0;
            //         flapTieRow.cells[3].innerText = 0;
            //         flapTieRow.cells[4].innerText = 0;
            //         flapTieRow.cells[5].innerText = 0;
            //     }
            // }

           // Helper functions
            function getCellValue(rows, rowIndex, colIndex) {
                const cell = rows[rowIndex]?.cells[colIndex];
                if (!cell) return 0;
                const txt = cell.textContent.trim();
                if (txt === "" || txt === "0" || txt === "0.00") return 0;
                const num = parseFloat(txt);
                return isNaN(num) ? 0 : num;
            }

            function setCellValue(rows, rowIndex, colIndex, value) {
                if (rows[rowIndex] && rows[rowIndex].cells[colIndex]) {
                    rows[rowIndex].cells[colIndex].textContent = 
                        value === 0 ? "0" : value.toFixed(2);
                }
            }

            function clearComponentSelections() {
                document.querySelectorAll(".dust-options input[type='checkbox']")
                    .forEach(cb => cb.checked = false);
                
                document.querySelectorAll(".dust-btn")
                    .forEach(btn => btn.classList.remove("active"));
                
                const dustLayer = document.getElementById("dust_layer");
                if (dustLayer) dustLayer.value = "";
            }

            function getDustComponents(layerType) {
                const components = [];
                
                const layerDiv = document.querySelector(`.dust-btn[data-type="${layerType}"]`)?.closest('.dust-item');
                if (!layerDiv) return components;
                
                layerDiv.querySelectorAll('.dust-options input[type="checkbox"]:checked').forEach(checkbox => {
                    components.push(checkbox.value);
                });
                
                return components;
            }


            function dust_proofing_particular() {
                console.log("=== dust_proofing_particular START ===");
                
                const rows = document.querySelectorAll('#dataGridView1 tbody tr');
                if (!rows.length) {
                    console.log("No rows found");
                    return;
                }
                
                const dust_proofing_box = document.getElementById("dust_proofing").value;
                const construction = document.getElementById("bag_type").value;
                
                console.log("dust_proofing_box:", dust_proofing_box);
                console.log("construction:", construction);
                console.log("Total rows:", rows.length);

                const calculationRows = [0, 2, 4, 6, 8, 10, 11, 31];
                calculationRows.forEach(row => {
                    setCellValue(rows, row, 11, 0);
                    setCellValue(rows, row, 12, 0);
                });

                /* ================= N/A ================= */
                if (dust_proofing_box === "N/A") {
                    console.log("N/A selected, returning");
                    return; 
                }

                /* ================= SINGLE ================= */
                if (dust_proofing_box === "Single") {
                    console.log("Processing SINGLE dust proofing");
                    
                    if (getCellValue(rows, 0, 5) > 0) {
                        const calculatedValue = (getCellValue(rows, 0, 5) * 2 / 100) * 4;
                        console.log("Row 0 calculation:", calculatedValue);
                        setCellValue(rows, 0, 11, calculatedValue);
                    } 
                    
                    if (getCellValue(rows, 0, 8) > 0 &&
                        (construction === "CIRCULAR CC" || construction === "CIRCULAR CC BFL")) {
                        console.log("Setting row 0 to 0 for circular construction");
                        setCellValue(rows, 0, 11, 0);
                    }

                    if (["4 PNL BFL CC", "4 PNL BFL CNR", "4 PNL CNR", "4 PNL CC"].includes(construction)
                        && getCellValue(rows, 2, 5) > 0) {
                        const value = (getCellValue(rows, 2, 5) * 2 / 100) * 4;
                        console.log("Row 2 calculation:", value);
                        setCellValue(rows, 2, 11, value);
                    }

                    if (getCellValue(rows, 4, 5) > 0) {
                        const total = (getCellValue(rows, 4, 5) + getCellValue(rows, 4, 4)) * 2 / 100 * 4;
                        console.log("Row 4 calculation:", total);
                        setCellValue(rows, 4, 11, total);
                    }

                    if (getCellValue(rows, 6, 4) > 0) {
                        const total = (getCellValue(rows, 6, 4) + getCellValue(rows, 6, 5)) * 2 / 100 * 4;
                        console.log("Row 6 calculation:", total);
                        setCellValue(rows, 6, 11, total);
                    }

                    if (getCellValue(rows, 8, 4) > 0) {
                        const total = (getCellValue(rows, 8, 4) + getCellValue(rows, 8, 5)) * 4 / 100;
                        console.log("Row 8 calculation:", total);
                        setCellValue(rows, 8, 11, total);
                    }

                    if (getCellValue(rows, 11, 4) > 0) {
                        const total = (getCellValue(rows, 11, 5) + getCellValue(rows, 11, 4)) * 4 / 100;
                        console.log("Row 11 calculation:", total);
                        setCellValue(rows, 11, 11, total);
                    }

                    if (getCellValue(rows, 31, 7) > 0) {
                        if (construction === "U+2 BAFFLE" || construction === "U+2 CC BAFFLE") {
                            const bodycut = (getCellValue(rows, 0, 5) * 2 / 100) * 4;
                            const sidecut = (getCellValue(rows, 2, 5) * 4 / 100) * 4;
                            console.log("Row 31 calculation (U+2):", bodycut + sidecut);
                            setCellValue(rows, 31, 11, bodycut + sidecut);
                        } else {
                            const total = ((getCellValue(rows, 0, 5) * 2 / 100) * 4) * 4;
                            console.log("Row 31 calculation:", total);
                            setCellValue(rows, 31, 11, total);
                        }
                    }
                }

                /* ================= DOUBLE ================= */
                else if (dust_proofing_box === "Double") {
                    console.log("Processing DOUBLE dust proofing");
                    
                    if (getCellValue(rows, 0, 5) > 0) {
                        setCellValue(rows, 0, 11, (getCellValue(rows, 0, 5) * 2 / 100) * 8);
                    }

                    if (getCellValue(rows, 0, 8) > 0 &&
                        (construction === "CIRCULAR CC" || construction === "CIRCULAR CC BFL")) {
                        setCellValue(rows, 0, 11, 0);
                    }

                    if (["4 PNL BFL CC", "4 PNL BFL CNR", "4 PNL CNR", "4 PNL CC"].includes(construction)
                        && getCellValue(rows, 2, 5) > 0) {
                        setCellValue(rows, 2, 11, (getCellValue(rows, 2, 5) * 2 / 100) * 8);
                    }

                    if (getCellValue(rows, 4, 5) > 0) {
                        const total = (getCellValue(rows, 4, 5) + getCellValue(rows, 4, 4)) * 2 / 100 * 8;
                        setCellValue(rows, 4, 11, total);
                    }

                    if (getCellValue(rows, 6, 4) > 0) {
                        const total = (getCellValue(rows, 6, 4) + getCellValue(rows, 6, 5)) * 2 / 100 * 8;
                        setCellValue(rows, 6, 11, total);
                    }

                    if (getCellValue(rows, 8, 5) > 0) {
                        const total = (getCellValue(rows, 8, 4) + getCellValue(rows, 8, 5)) * 8 / 100;
                        setCellValue(rows, 8, 11, total);
                    }

                    if (getCellValue(rows, 11, 5) > 0) {
                        const total = (getCellValue(rows, 11, 4) + getCellValue(rows, 11, 5)) * 8 / 100;
                        setCellValue(rows, 11, 11, total);
                    }

                    if (getCellValue(rows, 31, 8) > 0) {
                        if (construction === "U+2 BAFFLE" || construction === "U+2 CC BAFFLE") {
                            const bodycut = (getCellValue(rows, 0, 4) * 2 / 100) * 4;
                            const sidecut = (getCellValue(rows, 2, 4) * 4 / 100) * 4;
                            setCellValue(rows, 31, 11, bodycut + sidecut);
                        } else {
                            const total = ((getCellValue(rows, 0, 5) * 2 / 100) * 4) * 8;
                            setCellValue(rows, 31, 11, total);
                        }
                    }
                }

                /* ================= TRIPLE ================= */
                else if (dust_proofing_box === "Triple") {
                    console.log("Processing TRIPLE dust proofing");
                    
                    if (getCellValue(rows, 0, 5) > 0) {
                        const value = (getCellValue(rows, 0, 5) * 2 / 100) * 8;
                        setCellValue(rows, 0, 11, value);
                        setCellValue(rows, 0, 12, value);
                    }
                    
                    if (getCellValue(rows, 0, 8) > 0 && 
                        (construction === "CIRCULAR CC" || construction === "CIRCULAR CC BFL")) {
                        setCellValue(rows, 0, 11, 0);
                        setCellValue(rows, 0, 12, 0);
                    }

                    if (["4 PNL BFL CC", "4 PNL BFL CNR", "4 PNL CNR", "4 PNL CC"].includes(construction)
                        && getCellValue(rows, 2, 5) > 0) {
                        setCellValue(rows, 2, 11, (getCellValue(rows, 2, 5) * 2 / 100) * 8);
                        setCellValue(rows, 2, 12, (getCellValue(rows, 0, 5) * 2 / 100) * 8);
                    }
                    
                    if (getCellValue(rows, 4, 5) > 0) {
                        const value = ((getCellValue(rows, 4, 5) + getCellValue(rows, 4, 5)) * 2 / 100) * 8;
                        const value1 = (getCellValue(rows, 4, 5) * 4 / 100) * 8;
                        setCellValue(rows, 4, 11, value);
                        setCellValue(rows, 4, 12, value1);
                    }

                    if (getCellValue(rows, 6, 5) > 0) {
                        const value = ((getCellValue(rows, 6, 4) + getCellValue(rows, 6, 5)) * 2 / 100) * 8;
                        const value1 = (getCellValue(rows, 6, 4) * 4 / 100) * 8;
                        setCellValue(rows, 6, 11, value);
                        setCellValue(rows, 6, 12, value1);
                    }

                    if (getCellValue(rows, 8, 5) > 0) {
                        const value = (getCellValue(rows, 8, 5) + getCellValue(rows, 8, 4)) * 8 / 100;
                        const value1 = (getCellValue(rows, 8, 5) * 8) / 100;
                        setCellValue(rows, 8, 11, value);
                        setCellValue(rows, 8, 12, value1);
                    }

                    if (getCellValue(rows, 11, 5) > 0) {
                        const value = (getCellValue(rows, 11, 5) + getCellValue(rows, 11, 4)) * 8 / 100;
                        const value1 = (getCellValue(rows, 11, 5) * 8) / 100;
                        setCellValue(rows, 11, 11, value);
                        setCellValue(rows, 11, 12, value1);
                    }

                    if (!["U+2 BAFFLE", "U+2 CC BAFFLE"].includes(construction) 
                        && getCellValue(rows, 31, 8) > 0) {
                        setCellValue(rows, 31, 11, ((getCellValue(rows, 0, 5) * 2 / 100) * 4) * 8);
                        setCellValue(rows, 31, 12, ((getCellValue(rows, 0, 5) * 2 / 100) * 4) * 8);
                    }
                }
                
                console.log("=== dust_proofing_particular END ===");
            }

            function dust_proofing_component_wise() {
                console.log("=== dust_proofing_component_wise START ===");
                
                const rows = document.querySelectorAll('#dataGridView1 tbody tr');
                if (!rows.length) {
                    console.log("No rows found");
                    return;
                }

                const construction = document.getElementById("bag_type").value;
                const topFlapChecked = document.getElementById('top_flap')?.checked || false;
                
                console.log("construction:", construction);
                console.log("topFlapChecked:", topFlapChecked);

                const singleComponents = getDustComponents('Single') || [];
                const doubleComponents = getDustComponents('Double') || [];
                const tripleComponents = getDustComponents('Triple') || [];
                
                console.log("singleComponents:", singleComponents);
                console.log("doubleComponents:", doubleComponents);
                console.log("tripleComponents:", tripleComponents);

                /* =============== FIRST RESET ALL =============== */
                for (let i = 0; i < rows.length; i++) {
                    setCellValue(rows, i, 10, 0);  // Column 10
                    setCellValue(rows, i, 11, 0);  // Column 11
                    setCellValue(rows, i, 12, 0);  // Column 12
                }

                /* ================= SINGLE ================= */
                if (singleComponents.length > 0) {
                    console.log("Processing SINGLE components");
                    
                    if (singleComponents.includes("BODY")) {
                        if (getCellValue(rows, 0, 5) > 0) {
                            const value = (getCellValue(rows, 0, 5) * 2 / 100) * 4;
                            console.log("Single BODY calculation:", value);
                            setCellValue(rows, 0, 11, value);
                        }
                        
                        if (getCellValue(rows, 0, 8) > 0 && 
                            (construction === "CIRCULAR CC" || construction === "CIRCULAR CC BFL")) {
                            setCellValue(rows, 0, 11, 0);
                        }

                        if (["4 PNL BFL CC", "4 PNL BFL CNR", "4 PNL CNR", "4 PNL CC"].includes(construction)
                            && getCellValue(rows, 2, 5) > 0) {
                            const value = (getCellValue(rows, 2, 5) * 2 / 100) * 4;
                            console.log("Single BODY row 2 calculation:", value);
                            setCellValue(rows, 2, 11, value);
                        }
                    }

                    if (!topFlapChecked && singleComponents.includes("TOP")) {
                        if (getCellValue(rows, 4, 5) > 0) {
                            const value = ((getCellValue(rows, 4, 4) + getCellValue(rows, 4, 5)) * 2 / 100) * 4;
                            console.log("Single TOP calculation:", value);
                            setCellValue(rows, 4, 11, value);
                        }
                    }

                    if (singleComponents.includes("BOTTOM")) {
                        if (getCellValue(rows, 6, 5) > 0) {
                            const value = ((getCellValue(rows, 6, 4) + getCellValue(rows, 6, 5)) * 2 / 100) * 4;
                            console.log("Single BOTTOM calculation:", value);
                            setCellValue(rows, 6, 11, value);
                        }
                    }

                    if (singleComponents.includes("FS")) {
                        if (getCellValue(rows, 8, 5) > 0) {
                            const value = (getCellValue(rows, 8, 5) + getCellValue(rows, 8, 4)) * 4 / 100;
                            console.log("Single FS calculation:", value);
                            setCellValue(rows, 8, 11, value);
                        }
                    }

                    if (singleComponents.includes("DS")) {
                        if (getCellValue(rows, 11, 5) > 0) {
                            const value = (getCellValue(rows, 11, 5) + getCellValue(rows, 11, 4)) * 4 / 100;
                            console.log("Single DS calculation:", value);
                            setCellValue(rows, 11, 11, value);
                        }
                    }

                    if (singleComponents.includes("BAFFLE")) {
                        if (construction === "U+2 BAFFLE" || construction === "U+2 CC BAFFLE") {
                            if (getCellValue(rows, 31, 8) > 0) {
                                const bodycut = (getCellValue(rows, 0, 5) * 2 / 100) * 4;
                                const sidecut = (getCellValue(rows, 2, 5) * 4 / 100) * 4;
                                setCellValue(rows, 31, 11, bodycut + sidecut);
                            }
                        } else {
                            if (getCellValue(rows, 31, 8) > 0) {
                                setCellValue(rows, 31, 11, ((getCellValue(rows, 0, 5) * 2 / 100) * 4) * 4);
                            }
                        }
                    }
                }

                /* ================= DOUBLE ================= */
                if (doubleComponents.length > 0) {
                    console.log("Processing DOUBLE components");
                    
                    if (doubleComponents.includes("BODY")) {
                        if (getCellValue(rows, 0, 4) > 0) { 
                            setCellValue(rows, 0, 11, (getCellValue(rows, 0, 5) * 2 / 100) * 8);  
                        }
                        if (getCellValue(rows, 0, 7) > 0 && 
                            (construction === "CIRCULAR CC" || construction === "CIRCULAR CC BFL")) {
                            setCellValue(rows, 0, 11, 0);  
                        }
                        if (["4 PNL BFL CC", "4 PNL BFL CNR", "4 PNL CNR", "4 PNL CC"].includes(construction)
                            && getCellValue(rows, 2, 4) > 0) {
                            setCellValue(rows, 2, 11, (getCellValue(rows, 2, 5) * 2 / 100) * 8);  
                        }
                    }

                    if (!topFlapChecked && doubleComponents.includes("TOP")) {
                        if (getCellValue(rows, 4, 5) > 0) {
                            setCellValue(rows, 4, 11, ((getCellValue(rows, 4, 5) + getCellValue(rows, 4, 4)) * 2 / 100) * 8);
                        }
                    }

                    if (doubleComponents.includes("BOTTOM")) {
                        if (getCellValue(rows, 6, 5) > 0) {
                            setCellValue(rows, 6, 11, ((getCellValue(rows, 6, 5) + getCellValue(rows, 6, 4)) * 2 / 100) * 8);
                        }
                    }

                    if (doubleComponents.includes("FS")) {
                        if (getCellValue(rows, 8, 5) > 0) {
                            setCellValue(rows, 8, 11, (getCellValue(rows, 8, 5) + getCellValue(rows, 8, 4)) * 8 / 100);
                        }
                    }

                    if (doubleComponents.includes("DS")) {
                        if (getCellValue(rows, 11, 5) > 0) {
                            setCellValue(rows, 11, 11, (getCellValue(rows, 11, 5) + getCellValue(rows, 11, 4)) * 8 / 100);
                        }
                    }

                    if (doubleComponents.includes("BAFFLE")) {
                        if (construction === "U+2 BAFFLE" || construction === "U+2 CC BAFFLE") {
                            if (getCellValue(rows, 31, 8) > 0) {
                                const bodycut = (getCellValue(rows, 0, 5) * 2 / 100) * 4;
                                const sidecut = (getCellValue(rows, 2, 5) * 4 / 100) * 4;
                                setCellValue(rows, 31, 11, bodycut + sidecut);
                            }
                        } else {
                            if (getCellValue(rows, 31, 8) > 0) {
                                setCellValue(rows, 31, 11, ((getCellValue(rows, 0, 5) * 2 / 100) * 4) * 8);
                            }
                        }
                    }
                }

                /* ================= TRIPLE ================= */
                if (tripleComponents.length > 0) {
                    console.log("Processing TRIPLE components");
                    
                    if (tripleComponents.includes("BODY")) {
                        if (getCellValue(rows, 0, 5) > 0) {
                            setCellValue(rows, 0, 11, (getCellValue(rows, 0, 5) * 2 / 100) * 8);
                            setCellValue(rows, 0, 12, (getCellValue(rows, 0, 5) * 2 / 100) * 8);
                        }
                        if (getCellValue(rows, 0, 8) > 0 && 
                            (construction === "CIRCULAR CC" || construction === "CIRCULAR CC BFL")) {
                            setCellValue(rows, 0, 11, 0);
                            setCellValue(rows, 0, 12, 0);
                        }
                        if (["4 PNL BFL CC", "4 PNL BFL CNR", "4 PNL CNR", "4 PNL CC"].includes(construction)
                            && getCellValue(rows, 2, 5) > 0) {
                            setCellValue(rows, 2, 11, (getCellValue(rows, 2, 5) * 2 / 100) * 8);
                            setCellValue(rows, 2, 12, (getCellValue(rows, 0, 5) * 2 / 100) * 8);
                        }
                    }

                    if (!topFlapChecked && tripleComponents.includes("TOP")) {
                        if (getCellValue(rows, 4, 5) > 0) {
                            setCellValue(rows, 4, 11, ((getCellValue(rows, 4, 5) + getCellValue(rows, 4, 4)) * 2 / 100) * 8);
                            setCellValue(rows, 4, 12, (getCellValue(rows, 4, 5) * 4 / 100) * 8);
                        }
                    }

                    if (tripleComponents.includes("BOTTOM")) {
                        if (getCellValue(rows, 6, 5) > 0) {
                            setCellValue(rows, 6, 11, ((getCellValue(rows, 6, 5) + getCellValue(rows, 6, 4)) * 2 / 100) * 8);
                            setCellValue(rows, 6, 12, (getCellValue(rows, 6, 5) * 4 / 100) * 8);
                        }
                    }

                    if (tripleComponents.includes("FS")) {
                        if (getCellValue(rows, 8, 5) > 0) {
                            setCellValue(rows, 8, 11, (getCellValue(rows, 8, 5) + getCellValue(rows, 8, 4)) * 8 / 100);
                            setCellValue(rows, 8, 12, (getCellValue(rows, 8, 4) * 8) / 100);
                        }
                    }

                    if (tripleComponents.includes("DS")) {
                        if (getCellValue(rows, 11, 5) > 0) {
                            setCellValue(rows, 11, 11, (getCellValue(rows, 11, 5) + getCellValue(rows, 11, 4)) * 8 / 100);
                            setCellValue(rows, 11, 12, (getCellValue(rows, 11, 4) * 8) / 100);
                        }
                    }

                    if (tripleComponents.includes("BAFFLE")) {
                        if (construction === "U+2 BAFFLE" || construction === "U+2 CC BAFFLE") {
                            if (getCellValue(rows, 31, 8) > 0) {
                                const bodycut = (getCellValue(rows, 0, 5) * 2 / 100) * 4;
                                const sidecut = (getCellValue(rows, 2, 5) * 4 / 100) * 4;
                                setCellValue(rows, 31, 11, bodycut + sidecut);
                                setCellValue(rows, 31, 12, bodycut + sidecut);
                            }
                        } else {
                            if (getCellValue(rows, 31, 8) > 0) {
                                const value = ((getCellValue(rows, 0, 5) * 2 / 100) * 4) * 8;
                                setCellValue(rows, 31, 11, value);
                                setCellValue(rows, 31, 12, value);
                            }
                        }
                    }
                }
                            
                console.log("=== dust_proofing_component_wise END ===");
            }

            function calculateDustProofing() {
                console.log("=== calculateDustProofing START ===");
                
                const dustType = document.getElementById("dust_proofing").value;
                console.log("dustType:", dustType);

                if (dustType !== "N/A") {
                    console.log("Calling dust_proofing_particular");
                    dust_proofing_particular();
                } else {
                    console.log("Calling dust_proofing_component_wise");
                    dust_proofing_component_wise();
                }
                
                console.log("=== calculateDustProofing END ===");
            }

            function initializeDustProofing() {
                console.log("Initializing dust proofing events");
                
                // Remove any existing event listeners first
                const oldElement = document.getElementById("dust_proofing");
                const newElement = oldElement.cloneNode(true);
                oldElement.parentNode.replaceChild(newElement, oldElement);
                
                // Add event listener to dropdown
                document.getElementById("dust_proofing").addEventListener("change", function() {
                    console.log("Dropdown changed to:", this.value);
                    if (this.value !== "N/A") {
                        clearComponentSelections();
                    }
                    calculateDustProofing();
                });
                
                // Add event listeners to checkboxes
                document.querySelectorAll(".dust-options input[type='checkbox']").forEach(cb => {
                    cb.addEventListener("change", function(e) {
                        console.log("Checkbox changed:", this.value, this.checked);
                        
                        // Set dropdown to N/A
                        document.getElementById("dust_proofing").value = "N/A";
                        
                        // Activate corresponding button
                        const dustItem = e.target.closest('.dust-item');
                        const dustBtn = dustItem.querySelector('.dust-btn');
                        dustBtn.classList.add('active');
                        
                        // Calculate
                        calculateDustProofing();
                    });
                });
                
                // Add event listeners to buttons
                document.querySelectorAll(".dust-btn").forEach(btn => {
                    btn.addEventListener("click", function() {
                        console.log("Button clicked:", this.dataset.type);
                        
                        const isActive = this.classList.contains('active');
                        const dustItem = this.closest('.dust-item');
                        
                        if (!isActive) {
                            this.classList.add('active');
                        } else {
                            this.classList.remove('active');
                            dustItem.querySelectorAll('.dust-options input[type="checkbox"]').forEach(cb => {
                                cb.checked = false;
                            });
                        }
                        
                        // Set dropdown to N/A
                        document.getElementById("dust_proofing").value = "N/A";
                        
                        // Calculate
                        calculateDustProofing();
                    });
                });
                
                console.log("Dust proofing events initialized");
            }


            document.addEventListener('DOMContentLoaded', function() {
                console.log("DOM loaded - initializing dust proofing");
                initializeDustProofing();
                
            });


            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', initializeDustProofing);
            } else {
                initializeDustProofing();
            }




            baffle_all(rows);
            liner_asia(rows);
            hemming_liner(rows);
            fs_with_rope_new(rows);
            band_calc(rows);
            handleSkirtOrFS(rows);
            calculateDSTieOrRope(rows);
            processHemm(rows);
            calculateAllWeights(rows);
            loop_cover_form(rows);
              
  
        
        }


        document.querySelectorAll('input,select').forEach(el => {
            el.addEventListener('input', updateGridValues);
            el.addEventListener('change', updateGridValues);
        });

        document.getElementById('calculateBtn').addEventListener('click', () => {
            updateGridValues();
        });

        updateGridValues();
    });

        