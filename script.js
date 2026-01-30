// Khởi tạo dữ liệu từ localStorage hoặc mảng rỗng
let data = JSON.parse(localStorage.getItem('entryData')) || [];

// Lưu danh sách đang hiển thị (sau lọc) để xuất Excel theo tìm kiếm
let currentFilteredForExport = null;

// Cấu hình mẫu Excel (danh sách tiêu đề cột)
let templateHeaders = JSON.parse(localStorage.getItem('templateHeaders')) || null;

// Khởi tạo biểu đồ
let categoryChart = null;
let timelineChart = null;

// Kiểm tra đang ở chế độ nhập liệu theo mẫu Excel hay chế độ cố định
function isTemplateMode() {
    return Array.isArray(templateHeaders) && templateHeaders.length > 0;
}

// Thiết lập mặc định khi tải trang
document.addEventListener('DOMContentLoaded', function() {
    // Nếu đã bỏ tab "Nhập liệu" thì vô hiệu hoá chế độ mẫu Excel (tránh UI/logic bị lệch)
    if (!document.getElementById('entry-form')) {
        templateHeaders = null;
        localStorage.removeItem('templateHeaders');
    }

    // Thiết lập ngày mặc định cho form Tổ chức-Hành chính
    const tochucDateInput = document.getElementById('tochuc-date');
    if (tochucDateInput) {
        const today = new Date().toISOString().split('T')[0];
        tochucDateInput.value = today;
    }

    // Thiết lập ngày mặc định cho form Chống nhiễm khuẩn
    const ksnkDateInput = document.getElementById('ksnk-date');
    if (ksnkDateInput) {
        const today = new Date().toISOString().split('T')[0];
        ksnkDateInput.value = today;
    }

    // Thiết lập ngày mặc định cho form Kế hoạch nghiệp vụ
    const kehoachDateInput = document.getElementById('kehoach-date');
    if (kehoachDateInput) {
        const today = new Date().toISOString().split('T')[0];
        kehoachDateInput.value = today;
    }

    // Thiết lập ngày mặc định cho form Dược - XN-CĐHA
    const duocDateInput = document.getElementById('duoc-date');
    if (duocDateInput) {
        const today = new Date().toISOString().split('T')[0];
        duocDateInput.value = today;
    }

    // Khởi tạo giao diện mẫu Excel (nếu đã cấu hình trước đó)
    initTemplateUI();
    
    // Load dữ liệu khi trang được tải
    loadData();
    updateStatistics();
    
    // Xử lý form submit
    const form = document.getElementById('entry-form');
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }

    // Xử lý form submit cho tab Tổ chức-Hành chính
    const tochucForm = document.getElementById('tochuc-form');
    if (tochucForm) {
        tochucForm.addEventListener('submit', handleTochucFormSubmit);
    }

    // Xử lý form submit cho tab Chống nhiễm khuẩn
    const ksnkForm = document.getElementById('ksnk-form');
    if (ksnkForm) {
        ksnkForm.addEventListener('submit', handleKsnkFormSubmit);
    }

    // Xử lý form submit cho tab Kế hoạch nghiệp vụ
    const kehoachForm = document.getElementById('kehoach-form');
    if (kehoachForm) {
        kehoachForm.addEventListener('submit', handleKehoachFormSubmit);
    }

    // Xử lý form submit cho tab Dược - XN-CĐHA
    const duocForm = document.getElementById('duoc-form');
    if (duocForm) {
        duocForm.addEventListener('submit', handleDuocFormSubmit);
    }
});

// Chuyển đổi tab
function switchTab(tabName) {
    // Ẩn tất cả các tab
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Xóa active class từ tất cả các nút tab
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Hiển thị tab được chọn
    document.getElementById(tabName + '-tab').classList.add('active');
    
    // Thêm active class cho nút tab tương ứng
    event.target.classList.add('active');
    
    // Cập nhật thống kê nếu chuyển sang tab thống kê
    if (tabName === 'statistics') {
        updateStatistics();
    }
    
    // Load dữ liệu nếu chuyển sang tab dữ liệu
    if (tabName === 'data') {
        loadData();
    }

    // Thiết lập ngày mặc định khi chuyển sang tab Tổ chức-Hành chính
    if (tabName === 'tochuc') {
        const tochucDateInput = document.getElementById('tochuc-date');
        if (tochucDateInput && !tochucDateInput.value) {
            const today = new Date().toISOString().split('T')[0];
            tochucDateInput.value = today;
        }
    }

    // Thiết lập ngày mặc định khi chuyển sang tab Chống nhiễm khuẩn
    if (tabName === 'ksnk') {
        const ksnkDateInput = document.getElementById('ksnk-date');
        if (ksnkDateInput && !ksnkDateInput.value) {
            const today = new Date().toISOString().split('T')[0];
            ksnkDateInput.value = today;
        }
    }

    // Thiết lập ngày mặc định khi chuyển sang tab Kế hoạch nghiệp vụ
    if (tabName === 'kehoach') {
        const kehoachDateInput = document.getElementById('kehoach-date');
        if (kehoachDateInput && !kehoachDateInput.value) {
            const today = new Date().toISOString().split('T')[0];
            kehoachDateInput.value = today;
        }
    }

    // Thiết lập ngày mặc định khi chuyển sang tab Dược - XN-CĐHA
    if (tabName === 'duoc') {
        const duocDateInput = document.getElementById('duoc-date');
        if (duocDateInput && !duocDateInput.value) {
            const today = new Date().toISOString().split('T')[0];
            duocDateInput.value = today;
        }
    }
}

// Xử lý submit form
function handleFormSubmit(e) {
    e.preventDefault();

    let entry;

    if (isTemplateMode()) {
        // Bản ghi theo mẫu Excel: lưu các cột đúng như trong file
        entry = {
            id: Date.now(),
            mode: 'template',
            createdAt: new Date().toISOString()
        };

        templateHeaders.forEach((header, index) => {
            const input = document.getElementById(`template-field-${index}`);
            entry[header] = input ? (input.value || '').toString().trim() : '';
        });
    } else {
        // Bản ghi chế độ cố định cũ
        entry = {
            id: Date.now(), // ID duy nhất
            mode: 'fixed',
            name: document.getElementById('name').value.trim(),
            category: document.getElementById('category').value,
            value: parseFloat(document.getElementById('value').value),
            date: document.getElementById('date').value,
            notes: document.getElementById('notes').value.trim(),
            createdAt: new Date().toISOString()
        };
    }

    // Thêm vào mảng dữ liệu
    data.push(entry);
    
    // Lưu vào localStorage
    saveData();
    
    // Xóa form
    clearForm();
    
    // Hiển thị thông báo
    alert('✅ Đã lưu dữ liệu thành công!');
    
    // Tự động chuyển sang tab dữ liệu để xem kết quả
    setTimeout(() => {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            if (btn.textContent.includes('Dữ liệu')) {
                btn.click();
            }
        });
    }, 500);
}

// Xóa form
function clearForm() {
    document.getElementById('entry-form').reset();

    // Xóa các ô nhập liệu động (không xóa cấu hình)
    if (isTemplateMode() && Array.isArray(templateHeaders)) {
        templateHeaders.forEach((_, index) => {
            const input = document.getElementById(`template-field-${index}`);
            if (input) input.value = '';
        });
    }

    const dateInput = document.getElementById('date');
    if (dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.value = today;
    }
}

// Xử lý submit form Tổ chức-Hành chính quản trị
function handleTochucFormSubmit(e) {
    e.preventDefault();

    const entry = {
        id: Date.now(),
        mode: 'tochuc',
        date: document.getElementById('tochuc-date').value,
        evaluator: document.getElementById('tochuc-evaluator').value.trim(),
        hospital: document.getElementById('tochuc-hospital').value.trim(),
        // Section I: Tiêu chuẩn về cơ sở vật chất
        standard_1: document.querySelector('input[name="standard_1"]:checked')?.value || '',
        standard_2: document.querySelector('input[name="standard_2"]:checked')?.value || '',
        standard_3_1: document.querySelector('input[name="standard_3_1"]:checked')?.value || '',
        standard_3_2: document.querySelector('input[name="standard_3_2"]:checked')?.value || '',
        standard_4: document.querySelector('input[name="standard_4"]:checked')?.value || '',
        standard_5: document.querySelector('input[name="standard_5"]:checked')?.value || '',
        standard_8: document.querySelector('input[name="standard_8"]:checked')?.value || '',
        // Section II: Tiêu chuẩn về quy mô và cơ cấu tổ chức
        standard_II_1: document.querySelector('input[name="standard_II_1"]:checked')?.value || '',
        standard_II_2: document.querySelector('input[name="standard_II_2"]:checked')?.value || '',
        standard_II_3a: document.querySelector('input[name="standard_II_3a"]:checked')?.value || '',
        standard_II_3b: document.querySelector('input[name="standard_II_3b"]:checked')?.value || '',
        standard_II_4: document.querySelector('input[name="standard_II_4"]:checked')?.value || '',
        standard_II_5: document.querySelector('input[name="standard_II_5"]:checked')?.value || '',
        standard_II_6: document.querySelector('input[name="standard_II_6"]:checked')?.value || '',
        standard_II_7: document.querySelector('input[name="standard_II_7"]:checked')?.value || '',
        standard_II_8: document.querySelector('input[name="standard_II_8"]:checked')?.value || '',
        standard_II_9: document.querySelector('input[name="standard_II_9"]:checked')?.value || '',
        // Section III: Tiêu chuẩn về nhân sự
        standard_III_1: document.querySelector('input[name="standard_III_1"]:checked')?.value || '',
        standard_III_2: document.querySelector('input[name="standard_III_2"]:checked')?.value || '',
        notes: document.getElementById('tochuc-notes').value.trim(),
        createdAt: new Date().toISOString()
    };

    // Thêm vào mảng dữ liệu
    data.push(entry);

    // Lưu vào localStorage
    saveData();

    // Xóa form
    clearTochucForm();

    // Hiển thị thông báo
    alert('✅ Đã lưu đánh giá thành công!');

    // Tự động chuyển sang tab dữ liệu để xem kết quả
    setTimeout(() => {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            if (btn.textContent.includes('Dữ liệu')) {
                btn.click();
            }
        });
    }, 500);
}

// Xóa form Tổ chức-Hành chính
function clearTochucForm() {
    const form = document.getElementById('tochuc-form');
    if (form) {
        form.reset();
        
        const tochucDateInput = document.getElementById('tochuc-date');
        if (tochucDateInput) {
            const today = new Date().toISOString().split('T')[0];
            tochucDateInput.value = today;
        }
    }
}

// Xử lý submit form Chống nhiễm khuẩn
function handleKsnkFormSubmit(e) {
    e.preventDefault();

    const entry = {
        id: Date.now(),
        mode: 'ksnk',
        date: document.getElementById('ksnk-date').value,
        evaluator: document.getElementById('ksnk-evaluator').value.trim(),
        hospital: document.getElementById('ksnk-hospital').value.trim(),
        ksnk_6_1: document.querySelector('input[name="ksnk_6_1"]:checked')?.value || '',
        ksnk_6_2: document.querySelector('input[name="ksnk_6_2"]:checked')?.value || '',
        ksnk_V_5: document.querySelector('input[name="ksnk_V_5"]:checked')?.value || '',
        notes: document.getElementById('ksnk-notes').value.trim(),
        createdAt: new Date().toISOString()
    };

    data.push(entry);
    saveData();
    clearKsnkForm();

    alert('✅ Đã lưu đánh giá Chống nhiễm khuẩn!');

    setTimeout(() => {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            if (btn.textContent.includes('Dữ liệu')) {
                btn.click();
            }
        });
    }, 500);
}

// Xóa form Chống nhiễm khuẩn
function clearKsnkForm() {
    const form = document.getElementById('ksnk-form');
    if (form) {
        form.reset();

        const ksnkDateInput = document.getElementById('ksnk-date');
        if (ksnkDateInput) {
            const today = new Date().toISOString().split('T')[0];
            ksnkDateInput.value = today;
        }
    }
}

// Xử lý submit form Dược - XN-CĐHA
function handleDuocFormSubmit(e) {
    e.preventDefault();

    const entry = {
        id: Date.now(),
        mode: 'duoc',
        date: document.getElementById('duoc-date').value,
        evaluator: document.getElementById('duoc-evaluator').value.trim(),
        hospital: document.getElementById('duoc-hospital').value.trim(),
        // 7. An toàn bức xạ
        duoc_7_1: document.querySelector('input[name="duoc_7_1"]:checked')?.value || '',
        duoc_7_2: document.querySelector('input[name="duoc_7_2"]:checked')?.value || '',
        duoc_7_3: document.querySelector('input[name="duoc_7_3"]:checked')?.value || '',
        duoc_7_4: document.querySelector('input[name="duoc_7_4"]:checked')?.value || '',
        // IV. Thiết bị y tế
        duoc_IV_1: document.querySelector('input[name="duoc_IV_1"]:checked')?.value || '',
        duoc_IV_2: document.querySelector('input[name="duoc_IV_2"]:checked')?.value || '',
        duoc_IV_3: document.querySelector('input[name="duoc_IV_3"]:checked')?.value || '',
        duoc_IV_4: document.querySelector('input[name="duoc_IV_4"]:checked')?.value || '',
        duoc_IV_5: document.querySelector('input[name="duoc_IV_5"]:checked')?.value || '',
        notes: document.getElementById('duoc-notes').value.trim(),
        createdAt: new Date().toISOString()
    };

    data.push(entry);
    saveData();
    clearDuocForm();

    alert('✅ Đã lưu đánh giá Dược - XN-CĐHA!');

    setTimeout(() => {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            if (btn.textContent.includes('Dữ liệu')) {
                btn.click();
            }
        });
    }, 500);
}

// Xóa form Dược - XN-CĐHA
function clearDuocForm() {
    const form = document.getElementById('duoc-form');
    if (form) {
        form.reset();

        const duocDateInput = document.getElementById('duoc-date');
        if (duocDateInput) {
            const today = new Date().toISOString().split('T')[0];
            duocDateInput.value = today;
        }
    }
}

// Xử lý submit form Kế hoạch nghiệp vụ
function handleKehoachFormSubmit(e) {
    e.preventDefault();

    const entry = {
        id: Date.now(),
        mode: 'kehoach',
        date: document.getElementById('kehoach-date').value,
        evaluator: document.getElementById('kehoach-evaluator').value.trim(),
        hospital: document.getElementById('kehoach-hospital').value.trim(),
        kehoach_V_1: document.querySelector('input[name="kehoach_V_1"]:checked')?.value || '',
        kehoach_V_2: document.querySelector('input[name="kehoach_V_2"]:checked')?.value || '',
        kehoach_V_3_1: document.querySelector('input[name="kehoach_V_3_1"]:checked')?.value || '',
        kehoach_V_3_2: document.querySelector('input[name="kehoach_V_3_2"]:checked')?.value || '',
        kehoach_V_3_3: document.querySelector('input[name="kehoach_V_3_3"]:checked')?.value || '',
        kehoach_V_3_4: document.querySelector('input[name="kehoach_V_3_4"]:checked')?.value || '',
        kehoach_V_3_5: document.querySelector('input[name="kehoach_V_3_5"]:checked')?.value || '',
        kehoach_V_4_1: document.querySelector('input[name="kehoach_V_4_1"]:checked')?.value || '',
        kehoach_V_4_2: document.querySelector('input[name="kehoach_V_4_2"]:checked')?.value || '',
        kehoach_V_4_3: document.querySelector('input[name="kehoach_V_4_3"]:checked')?.value || '',
        kehoach_V_4_4: document.querySelector('input[name="kehoach_V_4_4"]:checked')?.value || '',
        kehoach_V_4_5: document.querySelector('input[name="kehoach_V_4_5"]:checked')?.value || '',
        kehoach_V_4_6: document.querySelector('input[name="kehoach_V_4_6"]:checked')?.value || '',
        notes: document.getElementById('kehoach-notes').value.trim(),
        createdAt: new Date().toISOString()
    };

    data.push(entry);
    saveData();
    clearKehoachForm();

    alert('✅ Đã lưu đánh giá Kế hoạch nghiệp vụ!');

    setTimeout(() => {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            if (btn.textContent.includes('Dữ liệu')) {
                btn.click();
            }
        });
    }, 500);
}

// Xóa form Kế hoạch nghiệp vụ
function clearKehoachForm() {
    const form = document.getElementById('kehoach-form');
    if (form) {
        form.reset();

        const kehoachDateInput = document.getElementById('kehoach-date');
        if (kehoachDateInput) {
            const today = new Date().toISOString().split('T')[0];
            kehoachDateInput.value = today;
        }
    }
}

// Lưu dữ liệu vào localStorage
function saveData() {
    localStorage.setItem('entryData', JSON.stringify(data));
}

// Load dữ liệu và hiển thị trong bảng
function loadData() {
    const tbody = document.getElementById('data-table-body');
    const thead = document.querySelector('#data-table thead');
    if (!tbody) return;

    const templateMode = isTemplateMode();
    const hasTochucData = data.some(item => item.mode === 'tochuc');
    const hasKsnkData = data.some(item => item.mode === 'ksnk');
    const hasDuocData = data.some(item => item.mode === 'duoc');
    const hasKehoachData = data.some(item => item.mode === 'kehoach');
    const hasSpecialData = hasTochucData || hasKsnkData || hasDuocData || hasKehoachData;

    // Xác định dữ liệu hiển thị theo chế độ
    let displayData;
    if (templateMode) {
        displayData = data.filter(item => item.mode === 'template');
    } else if (hasSpecialData) {
        // Nếu có dữ liệu đánh giá (Tổ chức-HC / Chống NK), hiển thị cả dữ liệu cố định + đánh giá
        displayData = data.filter(item => !item.mode || item.mode === 'fixed' || item.mode === 'tochuc' || item.mode === 'ksnk' || item.mode === 'duoc' || item.mode === 'kehoach');
    } else {
        displayData = data.filter(item => !item.mode || item.mode === 'fixed');
    }

    // Thiết lập tiêu đề bảng theo chế độ
    if (thead) {
        if (templateMode && Array.isArray(templateHeaders) && templateHeaders.length > 0) {
            let headerHtml = '<tr><th>STT</th>';
            templateHeaders.forEach(h => {
                headerHtml += `<th>${h}</th>`;
            });
            headerHtml += '<th>Thao tác</th></tr>';
            thead.innerHTML = headerHtml;
        } else if (hasSpecialData) {
            // Hiển thị bảng tổng hợp cho dữ liệu cố định + các tab đánh giá
            thead.innerHTML = `
                <tr>
                    <th>STT</th>
                    <th>Loại</th>
                    <th>Thông tin</th>
                    <th>Ngày</th>
                    <th>Chi tiết</th>
                    <th>Thao tác</th>
                </tr>
            `;
        } else {
            thead.innerHTML = `
                <tr>
                    <th>STT</th>
                    <th>Tên/Mã số</th>
                    <th>Danh mục</th>
                    <th>Giá trị</th>
                    <th>Ngày</th>
                    <th>Ghi chú</th>
                    <th>Thao tác</th>
                </tr>
            `;
        }
    }

    if (displayData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 20px; color: #999;">Chưa có dữ liệu. Hãy nhập dữ liệu mới!</td></tr>';
        return;
    }
    
    // Sắp xếp theo ngày mới nhất trước
    let sortedData;
    if (templateMode) {
        sortedData = [...displayData].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else {
        sortedData = [...displayData].sort((a, b) => {
            const dateA = a.date ? new Date(a.date) : new Date(a.createdAt);
            const dateB = b.date ? new Date(b.date) : new Date(b.createdAt);
            return dateB - dateA;
        });
    }

    // Lưu lại danh sách đang hiển thị để xuất theo tìm kiếm
    currentFilteredForExport = sortedData;

    if (templateMode) {
        tbody.innerHTML = sortedData.map((item, index) => {
            let cells = `<td>${index + 1}</td>`;
            templateHeaders.forEach(h => {
                const value = (item[h] || '').toString();
                cells += `<td>${value || '-'}</td>`;
            });
            cells += `
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-sm btn-secondary" onclick="editEntry(${item.id})">✏️ Sửa</button>
                        <button class="btn btn-sm btn-danger" onclick="deleteEntry(${item.id})">🗑️ Xóa</button>
                    </div>
                </td>
            `;
            return `<tr>${cells}</tr>`;
        }).join('');
    } else if (hasSpecialData) {
        // Hiển thị dữ liệu hỗn hợp (cố định + đánh giá)
        tbody.innerHTML = sortedData.map((item, index) => {
            if (item.mode === 'tochuc') {
                // Hiển thị dữ liệu Tổ chức-Hành chính
                const allStandards = [
                    // Section I
                    { label: 'I.1. Địa điểm cố định', value: item.standard_1 },
                    { label: 'I.2. Lối đi xe cứu thương', value: item.standard_2 },
                    { label: 'I.3.1. Bố trí phù hợp', value: item.standard_3_1 },
                    { label: 'I.3.2. Kết nối hạ tầng', value: item.standard_3_2 },
                    { label: 'I.4. Biển hiệu, sơ đồ', value: item.standard_4 },
                    { label: 'I.5. Phương tiện vận chuyển', value: item.standard_5 },
                    { label: 'I.8. Điện, nước', value: item.standard_8 },
                    // Section II
                    { label: 'II.1. Cơ cấu tổ chức', value: item.standard_II_1 },
                    { label: 'II.2. Khoa khám bệnh', value: item.standard_II_2 },
                    { label: 'II.3.a. Khoa lâm sàng (đa khoa)', value: item.standard_II_3a },
                    { label: 'II.3.b. Khoa lâm sàng (chuyên khoa)', value: item.standard_II_3b },
                    { label: 'II.4. Khoa cận lâm sàng', value: item.standard_II_4 },
                    { label: 'II.5. Khoa dược', value: item.standard_II_5 },
                    { label: 'II.6. Khoa dinh dưỡng', value: item.standard_II_6 },
                    { label: 'II.7. Khoa kiểm soát nhiễm khuẩn', value: item.standard_II_7 },
                    { label: 'II.8. Bộ phận chuyên môn khác', value: item.standard_II_8 },
                    { label: 'II.9. Phòng/bộ phận hành chính', value: item.standard_II_9 },
                    // Section III
                    { label: 'III.1. Phân công công việc', value: item.standard_III_1 },
                    { label: 'III.2. Cập nhật kiến thức', value: item.standard_III_2 }
                ];
                
                const evaluatedStandards = allStandards.filter(s => s.value);
                const totalStandards = allStandards.length;
                const evaluatedCount = evaluatedStandards.length;
                
                // Hiển thị tóm tắt: số lượng đã đánh giá và một số tiêu chuẩn quan trọng
                const summary = evaluatedCount > 0 
                    ? `Đã đánh giá: ${evaluatedCount}/${totalStandards} tiêu chuẩn. ${evaluatedStandards.slice(0, 3).map(s => `${s.label}: ${s.value}`).join('; ')}${evaluatedCount > 3 ? '...' : ''}`
                    : 'Chưa đánh giá';
                
                return `
                    <tr>
                        <td>${index + 1}</td>
                        <td><span class="category-badge" style="background: #28a745;">Tổ chức-HC</span></td>
                        <td><strong>${item.hospital || '-'}</strong><br><small>Người đánh giá: ${item.evaluator || '-'}</small></td>
                        <td>${formatDate(item.date)}</td>
                        <td><small>${summary}</small>${item.notes ? `<br><em>Ghi chú: ${item.notes}</em>` : ''}</td>
                        <td>
                            <div class="action-buttons">
                                <button class="btn btn-sm btn-secondary" onclick="editTochucEntry(${item.id})">✏️ Sửa</button>
                                <button class="btn btn-sm btn-danger" onclick="deleteEntry(${item.id})">🗑️ Xóa</button>
                            </div>
                        </td>
                    </tr>
                `;
            } else if (item.mode === 'ksnk') {
                const allStandards = [
                    { label: '6.1. Xử lý chất thải sinh hoạt', value: item.ksnk_6_1 },
                    { label: '6.2. Xử lý chất thải y tế', value: item.ksnk_6_2 },
                    { label: 'V.5. Kiểm soát nhiễm khuẩn', value: item.ksnk_V_5 }
                ];
                const evaluated = allStandards.filter(s => s.value);
                const summary = evaluated.length
                    ? `Đã đánh giá: ${evaluated.length}/${allStandards.length}. ${evaluated.map(s => `${s.label}: ${s.value}`).join('; ')}`
                    : 'Chưa đánh giá';

                return `
                    <tr>
                        <td>${index + 1}</td>
                        <td><span class="category-badge" style="background: #17a2b8;">Chống NK</span></td>
                        <td><strong>${item.hospital || '-'}</strong><br><small>Người đánh giá: ${item.evaluator || '-'}</small></td>
                        <td>${formatDate(item.date)}</td>
                        <td><small>${summary}</small>${item.notes ? `<br><em>Ghi chú: ${item.notes}</em>` : ''}</td>
                        <td>
                            <div class="action-buttons">
                                <button class="btn btn-sm btn-secondary" onclick="editKsnkEntry(${item.id})">✏️ Sửa</button>
                                <button class="btn btn-sm btn-danger" onclick="deleteEntry(${item.id})">🗑️ Xóa</button>
                            </div>
                        </td>
                    </tr>
                `;
            } else if (item.mode === 'duoc') {
                const allStandards = [
                    { label: '7.1. Giấy phép bức xạ', value: item.duoc_7_1 },
                    { label: '7.2. Phân công ATBX', value: item.duoc_7_2 },
                    { label: '7.3. Chứng chỉ NVBX', value: item.duoc_7_3 },
                    { label: '7.4. Liều kế', value: item.duoc_7_4 },
                    { label: 'IV.1. Hồ sơ TB', value: item.duoc_IV_1 },
                    { label: 'IV.2. Quy chế QLSD', value: item.duoc_IV_2 },
                    { label: 'IV.3. Quy trình vận hành', value: item.duoc_IV_3 },
                    { label: 'IV.4. Kiểm định/hiệu chuẩn', value: item.duoc_IV_4 },
                    { label: 'IV.5. Bộ phận & nhân sự', value: item.duoc_IV_5 }
                ];
                const evaluated = allStandards.filter(s => s.value);
                const summary = evaluated.length
                    ? `Đã đánh giá: ${evaluated.length}/${allStandards.length}. ${evaluated.slice(0, 3).map(s => `${s.label}: ${s.value}`).join('; ')}${evaluated.length > 3 ? '...' : ''}`
                    : 'Chưa đánh giá';

                return `
                    <tr>
                        <td>${index + 1}</td>
                        <td><span class="category-badge" style="background: #fd7e14;">Dược-XN-CĐHA</span></td>
                        <td><strong>${item.hospital || '-'}</strong><br><small>Người đánh giá: ${item.evaluator || '-'}</small></td>
                        <td>${formatDate(item.date)}</td>
                        <td><small>${summary}</small>${item.notes ? `<br><em>Ghi chú: ${item.notes}</em>` : ''}</td>
                        <td>
                            <div class="action-buttons">
                                <button class="btn btn-sm btn-secondary" onclick="editDuocEntry(${item.id})">✏️ Sửa</button>
                                <button class="btn btn-sm btn-danger" onclick="deleteEntry(${item.id})">🗑️ Xóa</button>
                            </div>
                        </td>
                    </tr>
                `;
            } else if (item.mode === 'kehoach') {
                const allStandards = [
                    { label: 'V.1 Trực 24/24', value: item.kehoach_V_1 },
                    { label: 'V.2 QT ngoại trú', value: item.kehoach_V_2 },
                    { label: 'V.3.1 PB QTKT', value: item.kehoach_V_3_1 },
                    { label: 'V.3.2 PB HDCĐ-ĐT', value: item.kehoach_V_3_2 },
                    { label: 'V.3.3 AD QTKT', value: item.kehoach_V_3_3 },
                    { label: 'V.3.4 AD HDCĐ-ĐT', value: item.kehoach_V_3_4 },
                    { label: 'V.3.5 Tuân thủ kê đơn', value: item.kehoach_V_3_5 },
                    { label: 'V.4.1 HT QLCL', value: item.kehoach_V_4_1 },
                    { label: 'V.4.2 QC HĐ QLCL', value: item.kehoach_V_4_2 },
                    { label: 'V.4.3 KH cải tiến CL', value: item.kehoach_V_4_3 },
                    { label: 'V.4.4 Chỉ số CL', value: item.kehoach_V_4_4 },
                    { label: 'V.4.5 QLCL XN', value: item.kehoach_V_4_5 },
                    { label: 'V.4.6 BC sự cố y khoa', value: item.kehoach_V_4_6 }
                ];
                const evaluated = allStandards.filter(s => s.value);
                const summary = evaluated.length
                    ? `Đã đánh giá: ${evaluated.length}/${allStandards.length}. ${evaluated.slice(0, 3).map(s => `${s.label}: ${s.value}`).join('; ')}${evaluated.length > 3 ? '...' : ''}`
                    : 'Chưa đánh giá';

                return `
                    <tr>
                        <td>${index + 1}</td>
                        <td><span class="category-badge" style="background: #6f42c1;">Kế hoạch NV</span></td>
                        <td><strong>${item.hospital || '-'}</strong><br><small>Người đánh giá: ${item.evaluator || '-'}</small></td>
                        <td>${formatDate(item.date)}</td>
                        <td><small>${summary}</small>${item.notes ? `<br><em>Ghi chú: ${item.notes}</em>` : ''}</td>
                        <td>
                            <div class="action-buttons">
                                <button class="btn btn-sm btn-secondary" onclick="editKehoachEntry(${item.id})">✏️ Sửa</button>
                                <button class="btn btn-sm btn-danger" onclick="deleteEntry(${item.id})">🗑️ Xóa</button>
                            </div>
                        </td>
                    </tr>
                `;
            } else {
                // Hiển thị dữ liệu cố định
                return `
                    <tr>
                        <td>${index + 1}</td>
                        <td><span class="category-badge">Nhập liệu</span></td>
                        <td><strong>${item.name}</strong><br><small>Danh mục: ${item.category}</small></td>
                        <td>${formatDate(item.date)}</td>
                        <td>Giá trị: <strong>${formatNumber(item.value)}</strong>${item.notes ? `<br>Ghi chú: ${item.notes}` : ''}</td>
                        <td>
                            <div class="action-buttons">
                                <button class="btn btn-sm btn-secondary" onclick="editEntry(${item.id})">✏️ Sửa</button>
                                <button class="btn btn-sm btn-danger" onclick="deleteEntry(${item.id})">🗑️ Xóa</button>
                            </div>
                        </td>
                    </tr>
                `;
            }
        }).join('');
    } else {
        tbody.innerHTML = sortedData.map((item, index) => `
            <tr>
                <td>${index + 1}</td>
                <td>${item.name}</td>
                <td><span class="category-badge">${item.category}</span></td>
                <td><strong>${formatNumber(item.value)}</strong></td>
                <td>${formatDate(item.date)}</td>
                <td>${item.notes || '-'}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-sm btn-secondary" onclick="editEntry(${item.id})">✏️ Sửa</button>
                        <button class="btn btn-sm btn-danger" onclick="deleteEntry(${item.id})">🗑️ Xóa</button>
                    </div>
                </td>
            </tr>
        `).join('');
    }
}

// Lọc dữ liệu
function filterData() {
    const searchTerm = (document.getElementById('search-input')?.value || '').toLowerCase();
    // Bộ lọc mới cho tab Dữ liệu
    const filterMode = document.getElementById('filter-mode')?.value || '';
    const filterCriterion = document.getElementById('filter-criterion')?.value || '__all__';
    const filterResult = document.getElementById('filter-result')?.value || '';
    // Bộ lọc cũ (nếu còn) - giữ để không lỗi
    const filterCategory = document.getElementById('filter-category')?.value || '';
    
    const tbody = document.getElementById('data-table-body');
    if (!tbody) return;
    
    const templateMode = isTemplateMode();

    let filteredData;
    if (templateMode) {
        filteredData = data.filter(item => item.mode === 'template');

        // Với mẫu Excel: bỏ qua lọc theo danh mục (không có khái niệm danh mục cố định)

        // Lọc theo từ khóa tìm kiếm trên tất cả cột
        if (searchTerm && Array.isArray(templateHeaders)) {
            filteredData = filteredData.filter(item => {
                return templateHeaders.some(h => {
                    const value = (item[h] || '').toString().toLowerCase();
                    return value.includes(searchTerm);
                });
            });
        }

        // Sắp xếp theo thời gian tạo
        filteredData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else {
        // Chỉ lấy các loại phiếu hiện có (bỏ fixed/template)
        filteredData = data.filter(item => item.mode === 'tochuc' || item.mode === 'ksnk' || item.mode === 'duoc' || item.mode === 'kehoach');

        // Lọc theo loại phiếu
        if (filterMode) {
            filteredData = filteredData.filter(item => item.mode === filterMode);
        }

        // Lọc theo tiêu chí + kết quả
        if (filterCriterion !== '__all__' || filterResult) {
            filteredData = filteredData.filter(item => {
                const criteriaKeys = [
                    // TCHC
                    'standard_1','standard_2','standard_3_1','standard_3_2','standard_4','standard_5','standard_8',
                    'standard_II_1','standard_II_2','standard_II_3a','standard_II_3b','standard_II_4','standard_II_5','standard_II_6','standard_II_7','standard_II_8','standard_II_9',
                    'standard_III_1','standard_III_2',
                    // KSNK
                    'ksnk_6_1','ksnk_6_2','ksnk_V_5',
                    // DƯỢC
                    'duoc_7_1','duoc_7_2','duoc_7_3','duoc_7_4',
                    'duoc_IV_1','duoc_IV_2','duoc_IV_3','duoc_IV_4','duoc_IV_5',
                    // KẾ HOẠCH
                    'kehoach_V_1','kehoach_V_2','kehoach_V_3_1','kehoach_V_3_2','kehoach_V_3_3','kehoach_V_3_4','kehoach_V_3_5',
                    'kehoach_V_4_1','kehoach_V_4_2','kehoach_V_4_3','kehoach_V_4_4','kehoach_V_4_5','kehoach_V_4_6'
                ];

                const matchesValue = (val) => {
                    if (!filterResult) return true;
                    return val === filterResult;
                };

                if (filterCriterion === '__all__') {
                    // Tất cả tiêu chí: chỉ cần 1 tiêu chí khớp kết quả
                    if (!filterResult) return true;
                    return criteriaKeys.some(k => matchesValue(item[k]));
                }

                // Từng tiêu chí
                const value = item[filterCriterion];
                return matchesValue(value);
            });
        }

        // Lọc theo danh mục cũ (nếu còn dữ liệu fixed) - không áp dụng cho phiếu đánh giá
        if (filterCategory) {
            // bỏ qua
        }

        // Lọc theo từ khóa tìm kiếm (tìm cả hospital/evaluator/notes và giá trị tiêu chí)
        if (searchTerm) {
            filteredData = filteredData.filter(item => {
                const base =
                    (item.hospital || '').toLowerCase() + ' ' +
                    (item.evaluator || '').toLowerCase() + ' ' +
                    (item.notes || '').toLowerCase();

                if (base.includes(searchTerm)) return true;

                // tìm trong các kết quả tiêu chí (Có/Không/Không áp dụng)
                const maybeKeys = Object.keys(item).filter(k => k !== 'id' && k !== 'mode' && k !== 'date' && k !== 'evaluator' && k !== 'hospital' && k !== 'notes' && k !== 'createdAt');
                return maybeKeys.some(k => (item[k] || '').toString().toLowerCase().includes(searchTerm));
            });
        }
        
        // Sắp xếp theo ngày mới nhất trước
        filteredData.sort((a, b) => {
            const dateA = a.date ? new Date(a.date) : new Date(a.createdAt);
            const dateB = b.date ? new Date(b.date) : new Date(b.createdAt);
            return dateB - dateA;
        });
    }

    // Lưu lại danh sách đang hiển thị để xuất theo tìm kiếm
    currentFilteredForExport = filteredData;
    
    if (filteredData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 20px; color: #999;">Không tìm thấy dữ liệu phù hợp.</td></tr>';
        return;
    }
    
    const hasTochucData = data.some(item => item.mode === 'tochuc');
    const hasKsnkData = data.some(item => item.mode === 'ksnk');
    const hasDuocData = data.some(item => item.mode === 'duoc');
    const hasKehoachData = data.some(item => item.mode === 'kehoach');
    const hasSpecialData = hasTochucData || hasKsnkData || hasDuocData || hasKehoachData;
    
    if (isTemplateMode()) {
        tbody.innerHTML = filteredData.map((item, index) => {
            let cells = `<td>${index + 1}</td>`;
            templateHeaders.forEach(h => {
                const value = (item[h] || '').toString();
                cells += `<td>${value || '-'}</td>`;
            });
            cells += `
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-sm btn-secondary" onclick="editEntry(${item.id})">✏️ Sửa</button>
                        <button class="btn btn-sm btn-danger" onclick="deleteEntry(${item.id})">🗑️ Xóa</button>
                    </div>
                </td>
            `;
            return `<tr>${cells}</tr>`;
        }).join('');
    } else if (hasSpecialData) {
        // Hiển thị dữ liệu hỗn hợp
        tbody.innerHTML = filteredData.map((item, index) => {
            if (item.mode === 'tochuc') {
                const allStandards = [
                    // Section I
                    { label: 'I.1. Địa điểm cố định', value: item.standard_1 },
                    { label: 'I.2. Lối đi xe cứu thương', value: item.standard_2 },
                    { label: 'I.3.1. Bố trí phù hợp', value: item.standard_3_1 },
                    { label: 'I.3.2. Kết nối hạ tầng', value: item.standard_3_2 },
                    { label: 'I.4. Biển hiệu, sơ đồ', value: item.standard_4 },
                    { label: 'I.5. Phương tiện vận chuyển', value: item.standard_5 },
                    { label: 'I.8. Điện, nước', value: item.standard_8 },
                    // Section II
                    { label: 'II.1. Cơ cấu tổ chức', value: item.standard_II_1 },
                    { label: 'II.2. Khoa khám bệnh', value: item.standard_II_2 },
                    { label: 'II.3.a. Khoa lâm sàng (đa khoa)', value: item.standard_II_3a },
                    { label: 'II.3.b. Khoa lâm sàng (chuyên khoa)', value: item.standard_II_3b },
                    { label: 'II.4. Khoa cận lâm sàng', value: item.standard_II_4 },
                    { label: 'II.5. Khoa dược', value: item.standard_II_5 },
                    { label: 'II.6. Khoa dinh dưỡng', value: item.standard_II_6 },
                    { label: 'II.7. Khoa kiểm soát nhiễm khuẩn', value: item.standard_II_7 },
                    { label: 'II.8. Bộ phận chuyên môn khác', value: item.standard_II_8 },
                    { label: 'II.9. Phòng/bộ phận hành chính', value: item.standard_II_9 },
                    // Section III
                    { label: 'III.1. Phân công công việc', value: item.standard_III_1 },
                    { label: 'III.2. Cập nhật kiến thức', value: item.standard_III_2 }
                ];
                
                const evaluatedStandards = allStandards.filter(s => s.value);
                const totalStandards = allStandards.length;
                const evaluatedCount = evaluatedStandards.length;
                
                // Hiển thị tóm tắt: số lượng đã đánh giá và một số tiêu chuẩn quan trọng
                const summary = evaluatedCount > 0 
                    ? `Đã đánh giá: ${evaluatedCount}/${totalStandards} tiêu chuẩn. ${evaluatedStandards.slice(0, 3).map(s => `${s.label}: ${s.value}`).join('; ')}${evaluatedCount > 3 ? '...' : ''}`
                    : 'Chưa đánh giá';
                
                return `
                    <tr>
                        <td>${index + 1}</td>
                        <td><span class="category-badge" style="background: #28a745;">Tổ chức-HC</span></td>
                        <td><strong>${item.hospital || '-'}</strong><br><small>Người đánh giá: ${item.evaluator || '-'}</small></td>
                        <td>${formatDate(item.date)}</td>
                        <td><small>${summary}</small>${item.notes ? `<br><em>Ghi chú: ${item.notes}</em>` : ''}</td>
                        <td>
                            <div class="action-buttons">
                                <button class="btn btn-sm btn-secondary" onclick="editTochucEntry(${item.id})">✏️ Sửa</button>
                                <button class="btn btn-sm btn-danger" onclick="deleteEntry(${item.id})">🗑️ Xóa</button>
                            </div>
                        </td>
                    </tr>
                `;
            } else if (item.mode === 'ksnk') {
                const allStandards = [
                    { label: '6.1. Xử lý chất thải sinh hoạt', value: item.ksnk_6_1 },
                    { label: '6.2. Xử lý chất thải y tế', value: item.ksnk_6_2 },
                    { label: 'V.5. Kiểm soát nhiễm khuẩn', value: item.ksnk_V_5 }
                ];
                const evaluated = allStandards.filter(s => s.value);
                const summary = evaluated.length
                    ? `Đã đánh giá: ${evaluated.length}/${allStandards.length}. ${evaluated.map(s => `${s.label}: ${s.value}`).join('; ')}`
                    : 'Chưa đánh giá';

                return `
                    <tr>
                        <td>${index + 1}</td>
                        <td><span class="category-badge" style="background: #17a2b8;">Chống NK</span></td>
                        <td><strong>${item.hospital || '-'}</strong><br><small>Người đánh giá: ${item.evaluator || '-'}</small></td>
                        <td>${formatDate(item.date)}</td>
                        <td><small>${summary}</small>${item.notes ? `<br><em>Ghi chú: ${item.notes}</em>` : ''}</td>
                        <td>
                            <div class="action-buttons">
                                <button class="btn btn-sm btn-secondary" onclick="editKsnkEntry(${item.id})">✏️ Sửa</button>
                                <button class="btn btn-sm btn-danger" onclick="deleteEntry(${item.id})">🗑️ Xóa</button>
                            </div>
                        </td>
                    </tr>
                `;
            } else if (item.mode === 'duoc') {
                const allStandards = [
                    { label: '7.1. Giấy phép bức xạ', value: item.duoc_7_1 },
                    { label: '7.2. Phân công ATBX', value: item.duoc_7_2 },
                    { label: '7.3. Chứng chỉ NVBX', value: item.duoc_7_3 },
                    { label: '7.4. Liều kế', value: item.duoc_7_4 },
                    { label: 'IV.1. Hồ sơ TB', value: item.duoc_IV_1 },
                    { label: 'IV.2. Quy chế QLSD', value: item.duoc_IV_2 },
                    { label: 'IV.3. Quy trình vận hành', value: item.duoc_IV_3 },
                    { label: 'IV.4. Kiểm định/hiệu chuẩn', value: item.duoc_IV_4 },
                    { label: 'IV.5. Bộ phận & nhân sự', value: item.duoc_IV_5 }
                ];
                const evaluated = allStandards.filter(s => s.value);
                const summary = evaluated.length
                    ? `Đã đánh giá: ${evaluated.length}/${allStandards.length}. ${evaluated.slice(0, 3).map(s => `${s.label}: ${s.value}`).join('; ')}${evaluated.length > 3 ? '...' : ''}`
                    : 'Chưa đánh giá';

                return `
                    <tr>
                        <td>${index + 1}</td>
                        <td><span class="category-badge" style="background: #fd7e14;">Dược-XN-CĐHA</span></td>
                        <td><strong>${item.hospital || '-'}</strong><br><small>Người đánh giá: ${item.evaluator || '-'}</small></td>
                        <td>${formatDate(item.date)}</td>
                        <td><small>${summary}</small>${item.notes ? `<br><em>Ghi chú: ${item.notes}</em>` : ''}</td>
                        <td>
                            <div class="action-buttons">
                                <button class="btn btn-sm btn-secondary" onclick="editDuocEntry(${item.id})">✏️ Sửa</button>
                                <button class="btn btn-sm btn-danger" onclick="deleteEntry(${item.id})">🗑️ Xóa</button>
                            </div>
                        </td>
                    </tr>
                `;
            } else if (item.mode === 'kehoach') {
                const allStandards = [
                    { label: 'V.1 Trực 24/24', value: item.kehoach_V_1 },
                    { label: 'V.2 QT ngoại trú', value: item.kehoach_V_2 },
                    { label: 'V.3.1 PB QTKT', value: item.kehoach_V_3_1 },
                    { label: 'V.3.2 PB HDCĐ-ĐT', value: item.kehoach_V_3_2 },
                    { label: 'V.3.3 AD QTKT', value: item.kehoach_V_3_3 },
                    { label: 'V.3.4 AD HDCĐ-ĐT', value: item.kehoach_V_3_4 },
                    { label: 'V.3.5 Tuân thủ kê đơn', value: item.kehoach_V_3_5 },
                    { label: 'V.4.1 HT QLCL', value: item.kehoach_V_4_1 },
                    { label: 'V.4.2 QC HĐ QLCL', value: item.kehoach_V_4_2 },
                    { label: 'V.4.3 KH cải tiến CL', value: item.kehoach_V_4_3 },
                    { label: 'V.4.4 Chỉ số CL', value: item.kehoach_V_4_4 },
                    { label: 'V.4.5 QLCL XN', value: item.kehoach_V_4_5 },
                    { label: 'V.4.6 BC sự cố y khoa', value: item.kehoach_V_4_6 }
                ];
                const evaluated = allStandards.filter(s => s.value);
                const summary = evaluated.length
                    ? `Đã đánh giá: ${evaluated.length}/${allStandards.length}. ${evaluated.slice(0, 3).map(s => `${s.label}: ${s.value}`).join('; ')}${evaluated.length > 3 ? '...' : ''}`
                    : 'Chưa đánh giá';

                return `
                    <tr>
                        <td>${index + 1}</td>
                        <td><span class="category-badge" style="background: #6f42c1;">Kế hoạch NV</span></td>
                        <td><strong>${item.hospital || '-'}</strong><br><small>Người đánh giá: ${item.evaluator || '-'}</small></td>
                        <td>${formatDate(item.date)}</td>
                        <td><small>${summary}</small>${item.notes ? `<br><em>Ghi chú: ${item.notes}</em>` : ''}</td>
                        <td>
                            <div class="action-buttons">
                                <button class="btn btn-sm btn-secondary" onclick="editKehoachEntry(${item.id})">✏️ Sửa</button>
                                <button class="btn btn-sm btn-danger" onclick="deleteEntry(${item.id})">🗑️ Xóa</button>
                            </div>
                        </td>
                    </tr>
                `;
            } else {
                return `
                    <tr>
                        <td>${index + 1}</td>
                        <td><span class="category-badge">Nhập liệu</span></td>
                        <td><strong>${item.name}</strong><br><small>Danh mục: ${item.category}</small></td>
                        <td>${formatDate(item.date)}</td>
                        <td>Giá trị: <strong>${formatNumber(item.value)}</strong>${item.notes ? `<br>Ghi chú: ${item.notes}` : ''}</td>
                        <td>
                            <div class="action-buttons">
                                <button class="btn btn-sm btn-secondary" onclick="editEntry(${item.id})">✏️ Sửa</button>
                                <button class="btn btn-sm btn-danger" onclick="deleteEntry(${item.id})">🗑️ Xóa</button>
                            </div>
                        </td>
                    </tr>
                `;
            }
        }).join('');
    } else {
        tbody.innerHTML = filteredData.map((item, index) => {
            const originalIndex = data.findIndex(d => d.id === item.id) + 1;
            return `
                <tr>
                    <td>${originalIndex}</td>
                    <td>${item.name}</td>
                    <td><span class="category-badge">${item.category}</span></td>
                    <td><strong>${formatNumber(item.value)}</strong></td>
                    <td>${formatDate(item.date)}</td>
                    <td>${item.notes || '-'}</td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn btn-sm btn-secondary" onclick="editEntry(${item.id})">✏️ Sửa</button>
                            <button class="btn btn-sm btn-danger" onclick="deleteEntry(${item.id})">🗑️ Xóa</button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }
}

// Xóa một bản ghi
function deleteEntry(id) {
    if (confirm('Bạn có chắc chắn muốn xóa bản ghi này?')) {
        data = data.filter(item => item.id !== id);
        saveData();
        loadData();
        updateStatistics();
        alert('✅ Đã xóa thành công!');
    }
}

// Sửa một bản ghi
function editEntry(id) {
    // Tab nhập liệu đã bị bỏ -> không cho sửa các bản ghi kiểu cũ
    if (!document.getElementById('entry-form')) {
        alert('Tab "Nhập liệu" đã bị bỏ, không thể sửa bản ghi kiểu nhập liệu cũ.');
        return;
    }

    const item = data.find(d => d.id === id);
    if (!item) return;

    if (isTemplateMode() && item.mode === 'template') {
        // Điền dữ liệu vào các ô động
        if (Array.isArray(templateHeaders)) {
            templateHeaders.forEach((header, index) => {
                const input = document.getElementById(`template-field-${index}`);
                if (input) {
                    input.value = (item[header] || '').toString();
                }
            });
        }
    } else {
        // Điền dữ liệu vào form cố định
        document.getElementById('name').value = item.name;
        document.getElementById('category').value = item.category;
        document.getElementById('value').value = item.value;
        document.getElementById('date').value = item.date;
        document.getElementById('notes').value = item.notes || '';
    }
    
    // Xóa bản ghi cũ
    data = data.filter(d => d.id !== id);
    saveData();
    
    // Chuyển sang tab nhập liệu
    document.querySelectorAll('.tab-btn')[0].click();
    
    // Scroll đến form
    document.getElementById('entry-form').scrollIntoView({ behavior: 'smooth' });
}

// Sửa một bản ghi Tổ chức-Hành chính
function editTochucEntry(id) {
    const item = data.find(d => d.id === id);
    if (!item || item.mode !== 'tochuc') return;

    // Điền dữ liệu vào form Tổ chức-Hành chính
    document.getElementById('tochuc-date').value = item.date || '';
    document.getElementById('tochuc-evaluator').value = item.evaluator || '';
    document.getElementById('tochuc-hospital').value = item.hospital || '';
    document.getElementById('tochuc-notes').value = item.notes || '';

    // Điền các radio button - Section I
    const sectionIStandards = ['standard_1', 'standard_2', 'standard_3_1', 'standard_3_2', 'standard_4', 'standard_5', 'standard_8'];
    sectionIStandards.forEach(standard => {
        if (item[standard]) {
            const radio = document.querySelector(`input[name="${standard}"][value="${item[standard]}"]`);
            if (radio) radio.checked = true;
        }
    });

    // Điền các radio button - Section II
    const sectionIIStandards = ['standard_II_1', 'standard_II_2', 'standard_II_3a', 'standard_II_3b', 'standard_II_4', 
                                 'standard_II_5', 'standard_II_6', 'standard_II_7', 'standard_II_8', 'standard_II_9'];
    sectionIIStandards.forEach(standard => {
        if (item[standard]) {
            const radio = document.querySelector(`input[name="${standard}"][value="${item[standard]}"]`);
            if (radio) radio.checked = true;
        }
    });

    // Điền các radio button - Section III
    const sectionIIIStandards = ['standard_III_1', 'standard_III_2'];
    sectionIIIStandards.forEach(standard => {
        if (item[standard]) {
            const radio = document.querySelector(`input[name="${standard}"][value="${item[standard]}"]`);
            if (radio) radio.checked = true;
        }
    });
    
    // Xóa bản ghi cũ
    data = data.filter(d => d.id !== id);
    saveData();
    
    // Chuyển sang tab Tổ chức-Hành chính
    document.querySelectorAll('.tab-btn').forEach(btn => {
        if (btn.textContent.includes('Tổ chức')) {
            btn.click();
        }
    });
    
    // Scroll đến form
    setTimeout(() => {
        document.getElementById('tochuc-form').scrollIntoView({ behavior: 'smooth' });
    }, 100);
}

// Sửa một bản ghi Chống nhiễm khuẩn
function editKsnkEntry(id) {
    const item = data.find(d => d.id === id);
    if (!item || item.mode !== 'ksnk') return;

    document.getElementById('ksnk-date').value = item.date || '';
    document.getElementById('ksnk-evaluator').value = item.evaluator || '';
    document.getElementById('ksnk-hospital').value = item.hospital || '';
    document.getElementById('ksnk-notes').value = item.notes || '';

    if (item.ksnk_6_1) {
        const radio = document.querySelector(`input[name="ksnk_6_1"][value="${item.ksnk_6_1}"]`);
        if (radio) radio.checked = true;
    }
    if (item.ksnk_6_2) {
        const radio = document.querySelector(`input[name="ksnk_6_2"][value="${item.ksnk_6_2}"]`);
        if (radio) radio.checked = true;
    }
    if (item.ksnk_V_5) {
        const radio = document.querySelector(`input[name="ksnk_V_5"][value="${item.ksnk_V_5}"]`);
        if (radio) radio.checked = true;
    }

    // Xóa bản ghi cũ
    data = data.filter(d => d.id !== id);
    saveData();

    // Chuyển sang tab Chống nhiễm khuẩn
    document.querySelectorAll('.tab-btn').forEach(btn => {
        if (btn.textContent.includes('Chống nhiễm khuẩn') || btn.textContent.includes('Chống nhiễm')) {
            btn.click();
        }
    });

    setTimeout(() => {
        document.getElementById('ksnk-form').scrollIntoView({ behavior: 'smooth' });
    }, 100);
}

// Sửa một bản ghi Dược - XN-CĐHA
function editDuocEntry(id) {
    const item = data.find(d => d.id === id);
    if (!item || item.mode !== 'duoc') return;

    document.getElementById('duoc-date').value = item.date || '';
    document.getElementById('duoc-evaluator').value = item.evaluator || '';
    document.getElementById('duoc-hospital').value = item.hospital || '';
    document.getElementById('duoc-notes').value = item.notes || '';

    const radios = [
        { name: 'duoc_7_1', value: item.duoc_7_1 },
        { name: 'duoc_7_2', value: item.duoc_7_2 },
        { name: 'duoc_7_3', value: item.duoc_7_3 },
        { name: 'duoc_7_4', value: item.duoc_7_4 },
        { name: 'duoc_IV_1', value: item.duoc_IV_1 },
        { name: 'duoc_IV_2', value: item.duoc_IV_2 },
        { name: 'duoc_IV_3', value: item.duoc_IV_3 },
        { name: 'duoc_IV_4', value: item.duoc_IV_4 },
        { name: 'duoc_IV_5', value: item.duoc_IV_5 }
    ];

    radios.forEach(r => {
        if (!r.value) return;
        const radio = document.querySelector(`input[name="${r.name}"][value="${r.value}"]`);
        if (radio) radio.checked = true;
    });

    // Xóa bản ghi cũ
    data = data.filter(d => d.id !== id);
    saveData();

    // Chuyển sang tab Dược - XN-CĐHA
    document.querySelectorAll('.tab-btn').forEach(btn => {
        if (btn.textContent.includes('Dược') || btn.textContent.includes('XN-CĐHA')) {
            btn.click();
        }
    });

    setTimeout(() => {
        document.getElementById('duoc-form').scrollIntoView({ behavior: 'smooth' });
    }, 100);
}

// Sửa một bản ghi Kế hoạch nghiệp vụ
function editKehoachEntry(id) {
    const item = data.find(d => d.id === id);
    if (!item || item.mode !== 'kehoach') return;

    document.getElementById('kehoach-date').value = item.date || '';
    document.getElementById('kehoach-evaluator').value = item.evaluator || '';
    document.getElementById('kehoach-hospital').value = item.hospital || '';
    document.getElementById('kehoach-notes').value = item.notes || '';

    const radios = [
        { name: 'kehoach_V_1', value: item.kehoach_V_1 },
        { name: 'kehoach_V_2', value: item.kehoach_V_2 },
        { name: 'kehoach_V_3_1', value: item.kehoach_V_3_1 },
        { name: 'kehoach_V_3_2', value: item.kehoach_V_3_2 },
        { name: 'kehoach_V_3_3', value: item.kehoach_V_3_3 },
        { name: 'kehoach_V_3_4', value: item.kehoach_V_3_4 },
        { name: 'kehoach_V_3_5', value: item.kehoach_V_3_5 },
        { name: 'kehoach_V_4_1', value: item.kehoach_V_4_1 },
        { name: 'kehoach_V_4_2', value: item.kehoach_V_4_2 },
        { name: 'kehoach_V_4_3', value: item.kehoach_V_4_3 },
        { name: 'kehoach_V_4_4', value: item.kehoach_V_4_4 },
        { name: 'kehoach_V_4_5', value: item.kehoach_V_4_5 },
        { name: 'kehoach_V_4_6', value: item.kehoach_V_4_6 }
    ];
    radios.forEach(r => {
        if (!r.value) return;
        const radio = document.querySelector(`input[name="${r.name}"][value="${r.value}"]`);
        if (radio) radio.checked = true;
    });

    // Xóa bản ghi cũ
    data = data.filter(d => d.id !== id);
    saveData();

    // Chuyển sang tab Kế hoạch nghiệp vụ
    document.querySelectorAll('.tab-btn').forEach(btn => {
        if (btn.textContent.includes('Kế hoạch')) {
            btn.click();
        }
    });

    setTimeout(() => {
        document.getElementById('kehoach-form').scrollIntoView({ behavior: 'smooth' });
    }, 100);
}

// Xóa tất cả dữ liệu
function confirmDeleteAll() {
    if (confirm('⚠️ CẢNH BÁO: Bạn có chắc chắn muốn xóa TẤT CẢ dữ liệu? Hành động này không thể hoàn tác!')) {
        if (confirm('Xác nhận lần cuối: Xóa tất cả dữ liệu?')) {
            data = [];
            saveData();
            loadData();
            updateStatistics();
            alert('✅ Đã xóa tất cả dữ liệu!');
        }
    }
}

// Cập nhật thống kê
function updateStatistics() {
    const evalModes = new Set(['tochuc', 'ksnk', 'duoc', 'kehoach']);
    const records = data.filter(item => evalModes.has(item.mode));

    // Không có phiếu đánh giá
    if (records.length === 0) {
        document.getElementById('total-records').textContent = '0';
        document.getElementById('total-value').textContent = '0';
        document.getElementById('avg-value').textContent = '0%';
        document.getElementById('today-records').textContent = '0';

        if (categoryChart) categoryChart.destroy();
        if (timelineChart) timelineChart.destroy();

        document.getElementById('top-values').innerHTML = '<p style="text-align: center; color: #999; padding: 20px;">Chưa có phiếu đánh giá để thống kê.</p>';
        return;
    }

    // Đếm theo nhóm I–V
    const bySection = {
        I: { co: 0, khong: 0, na: 0 },
        II: { co: 0, khong: 0, na: 0 },
        III: { co: 0, khong: 0, na: 0 },
        IV: { co: 0, khong: 0, na: 0 },
        V: { co: 0, khong: 0, na: 0 }
    };

    const byType = { tochuc: 0, ksnk: 0, duoc: 0, kehoach: 0 };

    function addAnswer(sectionKey, value) {
        if (!value) return;
        if (value === 'Có') bySection[sectionKey].co += 1;
        else if (value === 'Không') bySection[sectionKey].khong += 1;
        else if (value === 'Không áp dụng') bySection[sectionKey].na += 1;
    }

    records.forEach(item => {
        if (byType[item.mode] !== undefined) byType[item.mode] += 1;

        if (item.mode === 'tochuc') {
            // I
            ['standard_1', 'standard_2', 'standard_3_1', 'standard_3_2', 'standard_4', 'standard_5', 'standard_8'].forEach(k => addAnswer('I', item[k]));
            // II
            ['standard_II_1', 'standard_II_2', 'standard_II_3a', 'standard_II_3b', 'standard_II_4', 'standard_II_5', 'standard_II_6', 'standard_II_7', 'standard_II_8', 'standard_II_9'].forEach(k => addAnswer('II', item[k]));
            // III
            ['standard_III_1', 'standard_III_2'].forEach(k => addAnswer('III', item[k]));
        } else if (item.mode === 'ksnk') {
            // I (6.* thuộc nhóm I trong mẫu)
            ['ksnk_6_1', 'ksnk_6_2'].forEach(k => addAnswer('I', item[k]));
            // V
            ['ksnk_V_5'].forEach(k => addAnswer('V', item[k]));
        } else if (item.mode === 'duoc') {
            // I (7.* thuộc nhóm I trong mẫu)
            ['duoc_7_1', 'duoc_7_2', 'duoc_7_3', 'duoc_7_4'].forEach(k => addAnswer('I', item[k]));
            // IV
            ['duoc_IV_1', 'duoc_IV_2', 'duoc_IV_3', 'duoc_IV_4', 'duoc_IV_5'].forEach(k => addAnswer('IV', item[k]));
        } else if (item.mode === 'kehoach') {
            // V
            [
                'kehoach_V_1', 'kehoach_V_2',
                'kehoach_V_3_1', 'kehoach_V_3_2', 'kehoach_V_3_3', 'kehoach_V_3_4', 'kehoach_V_3_5',
                'kehoach_V_4_1', 'kehoach_V_4_2', 'kehoach_V_4_3', 'kehoach_V_4_4', 'kehoach_V_4_5', 'kehoach_V_4_6'
            ].forEach(k => addAnswer('V', item[k]));
        }
    });

    const sections = ['I', 'II', 'III', 'IV', 'V'];
    const totalCo = sections.reduce((s, k) => s + bySection[k].co, 0);
    const totalKhong = sections.reduce((s, k) => s + bySection[k].khong, 0);
    const totalNa = sections.reduce((s, k) => s + bySection[k].na, 0);
    const totalAnswered = totalCo + totalKhong + totalNa;

    const denom = totalCo + totalKhong;
    const tiLeCo = denom ? (totalCo / denom) * 100 : 0;

    // Cards
    document.getElementById('total-records').textContent = records.length;
    document.getElementById('total-value').textContent = formatNumber(totalAnswered);
    document.getElementById('avg-value').textContent = `${tiLeCo.toFixed(1)}%`;

    const today = new Date().toISOString().split('T')[0];
    const todayRecords = records.filter(r => r.date === today).length;
    document.getElementById('today-records').textContent = todayRecords;

    // Bảng tổng hợp
    const labelsMap = {
        I: 'I. Cơ sở vật chất',
        II: 'II. Quy mô & cơ cấu tổ chức',
        III: 'III. Nhân sự',
        IV: 'IV. Thiết bị y tế',
        V: 'V. Chuyên môn'
    };

    const tableRows = sections.map(k => {
        const co = bySection[k].co;
        const khong = bySection[k].khong;
        const na = bySection[k].na;
        const total = co + khong + na;
        const rate = (co + khong) ? `${((co / (co + khong)) * 100).toFixed(1)}%` : '-';
        return `
            <tr>
                <td><strong>${labelsMap[k]}</strong></td>
                <td>${co}</td>
                <td>${khong}</td>
                <td>${na}</td>
                <td>${total}</td>
                <td>${rate}</td>
            </tr>
        `;
    }).join('');

    const typeRows = Object.entries(byType).map(([k, v]) => {
        const name = k === 'tochuc' ? 'Tổ chức-Hành chính' :
            k === 'ksnk' ? 'Chống nhiễm khuẩn' :
            k === 'duoc' ? 'Dược - XN-CĐHA' :
            'Kế hoạch nghiệp vụ';
        return `<tr><td>${name}</td><td>${v}</td></tr>`;
    }).join('');

    document.getElementById('top-values').innerHTML = `
        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th>Nhóm</th>
                        <th>Có</th>
                        <th>Không</th>
                        <th>Không áp dụng</th>
                        <th>Tổng</th>
                        <th>Tỷ lệ Có</th>
                    </tr>
                </thead>
                <tbody>
                    ${tableRows}
                </tbody>
            </table>
        </div>
        <div style="height: 14px;"></div>
        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th>Loại phiếu</th>
                        <th>Số phiếu</th>
                    </tr>
                </thead>
                <tbody>
                    ${typeRows}
                </tbody>
            </table>
        </div>
    `;

    // Biểu đồ theo nhóm I–V (stacked)
    const sectionCtx = document.getElementById('category-chart');
    if (sectionCtx) {
        if (categoryChart) categoryChart.destroy();
        categoryChart = new Chart(sectionCtx, {
            type: 'bar',
            data: {
                labels: sections,
                datasets: [
                    { label: 'Có', data: sections.map(k => bySection[k].co), backgroundColor: '#28a745' },
                    { label: 'Không', data: sections.map(k => bySection[k].khong), backgroundColor: '#dc3545' },
                    { label: 'Không áp dụng', data: sections.map(k => bySection[k].na), backgroundColor: '#6c757d' }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                scales: {
                    x: { stacked: true },
                    y: { stacked: true, beginAtZero: true }
                },
                plugins: {
                    legend: { position: 'bottom' }
                }
            }
        });
    }

    // Biểu đồ theo loại phiếu
    const typeCtx = document.getElementById('timeline-chart');
    if (typeCtx) {
        if (timelineChart) timelineChart.destroy();
        const typeKeys = ['tochuc', 'ksnk', 'duoc', 'kehoach'];
        const typeLabels = ['Tổ chức-HC', 'Chống NK', 'Dược-XN-CĐHA', 'Kế hoạch NV'];
        timelineChart = new Chart(typeCtx, {
            type: 'bar',
            data: {
                labels: typeLabels,
                datasets: [{
                    label: 'Số phiếu',
                    data: typeKeys.map(k => byType[k] || 0),
                    backgroundColor: ['#28a745', '#17a2b8', '#fd7e14', '#6f42c1']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                scales: { y: { beginAtZero: true } },
                plugins: { legend: { display: false } }
            }
        });
    }
}

// Cập nhật biểu đồ danh mục
function updateCategoryChart(sourceData = data) {
    const ctx = document.getElementById('category-chart');
    if (!ctx) return;
    
    const categoryStats = {};
    sourceData.forEach(item => {
        categoryStats[item.category] = (categoryStats[item.category] || 0) + item.value;
    });
    
    const categories = Object.keys(categoryStats);
    const values = Object.values(categoryStats);
    
    if (categoryChart) {
        categoryChart.destroy();
    }
    
    categoryChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: categories.map(cat => `Loại ${cat}`),
            datasets: [{
                data: values,
                backgroundColor: [
                    '#667eea',
                    '#764ba2',
                    '#f093fb',
                    '#4facfe',
                    '#43e97b'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

// Cập nhật biểu đồ thời gian
function updateTimelineChart(sourceData = data) {
    const ctx = document.getElementById('timeline-chart');
    if (!ctx) return;
    
    // Nhóm dữ liệu theo ngày
    const dateGroups = {};
    sourceData.forEach(item => {
        if (!dateGroups[item.date]) {
            dateGroups[item.date] = 0;
        }
        dateGroups[item.date] += item.value;
    });
    
    const dates = Object.keys(dateGroups).sort();
    const values = dates.map(date => dateGroups[date]);
    
    if (timelineChart) {
        timelineChart.destroy();
    }
    
    timelineChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: dates.map(date => formatDate(date)),
            datasets: [{
                label: 'Tổng giá trị',
                data: values,
                borderColor: '#667eea',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                }
            }
        }
    });
}

// Cập nhật top 10 giá trị cao nhất
function updateTopValues(sourceData = data) {
    const topValuesDiv = document.getElementById('top-values');
    if (!topValuesDiv) return;
    
    const sortedData = [...sourceData].sort((a, b) => b.value - a.value).slice(0, 10);
    
    if (sortedData.length === 0) {
        topValuesDiv.innerHTML = '<p style="text-align: center; color: #999; padding: 20px;">Chưa có dữ liệu.</p>';
        return;
    }
    
    topValuesDiv.innerHTML = sortedData.map((item, index) => `
        <div class="top-value-item">
            <div class="rank">#${index + 1}</div>
            <div class="info">
                <div class="name">${item.name}</div>
                <div class="value">Loại ${item.category} • ${formatDate(item.date)}</div>
            </div>
            <div class="amount">${formatNumber(item.value)}</div>
        </div>
    `).join('');
}

// Xuất dữ liệu ra Excel (CSV format)
function exportData() {
    const list = Array.isArray(currentFilteredForExport) ? currentFilteredForExport : [];
    if (list.length === 0) {
        alert('Không có dữ liệu đang hiển thị để xuất (hãy vào tab Dữ liệu và thực hiện tìm kiếm/lọc trước).');
        return;
    }

    const escapeCsv = (val) => `"${(val ?? '').toString().replace(/"/g, '""')}"`;

    const modeLabel = (mode) => {
        if (mode === 'tochuc') return 'Tổ chức-Hành chính';
        if (mode === 'ksnk') return 'Chống nhiễm khuẩn';
        if (mode === 'duoc') return 'Dược - XN-CĐHA';
        if (mode === 'kehoach') return 'Kế hoạch nghiệp vụ';
        if (mode === 'template') return 'Excel mẫu';
        if (mode === 'fixed') return 'Nhập liệu';
        return mode || '';
    };

    // Danh sách cột tiêu chí (để xuất theo từng tiêu chí)
    const CRITERIA = [
        // TCHC
        'standard_1','standard_2','standard_3_1','standard_3_2','standard_4','standard_5','standard_8',
        'standard_II_1','standard_II_2','standard_II_3a','standard_II_3b','standard_II_4','standard_II_5','standard_II_6','standard_II_7','standard_II_8','standard_II_9',
        'standard_III_1','standard_III_2',
        // KSNK
        'ksnk_6_1','ksnk_6_2','ksnk_V_5',
        // DƯỢC
        'duoc_7_1','duoc_7_2','duoc_7_3','duoc_7_4',
        'duoc_IV_1','duoc_IV_2','duoc_IV_3','duoc_IV_4','duoc_IV_5',
        // KẾ HOẠCH
        'kehoach_V_1','kehoach_V_2','kehoach_V_3_1','kehoach_V_3_2','kehoach_V_3_3','kehoach_V_3_4','kehoach_V_3_5',
        'kehoach_V_4_1','kehoach_V_4_2','kehoach_V_4_3','kehoach_V_4_4','kehoach_V_4_5','kehoach_V_4_6'
    ];

    const CRITERIA_LABELS = {
        standard_1: 'I.1 Địa điểm cố định',
        standard_2: 'I.2 Lối đi xe cứu thương',
        standard_3_1: 'I.3.1 Bố trí phù hợp',
        standard_3_2: 'I.3.2 Kết nối hạ tầng',
        standard_4: 'I.4 Biển hiệu, sơ đồ',
        standard_5: 'I.5 Phương tiện vận chuyển',
        standard_8: 'I.8 Điện, nước',
        standard_II_1: 'II.1 Cơ cấu tổ chức',
        standard_II_2: 'II.2 Khoa khám bệnh',
        standard_II_3a: 'II.3a Khoa lâm sàng (đa khoa)',
        standard_II_3b: 'II.3b Khoa lâm sàng (chuyên khoa)',
        standard_II_4: 'II.4 Khoa cận lâm sàng',
        standard_II_5: 'II.5 Khoa dược',
        standard_II_6: 'II.6 Khoa dinh dưỡng',
        standard_II_7: 'II.7 Khoa KSNK',
        standard_II_8: 'II.8 Bộ phận chuyên môn khác',
        standard_II_9: 'II.9 Phòng/bộ phận hành chính',
        standard_III_1: 'III.1 Phân công công việc',
        standard_III_2: 'III.2 Cập nhật kiến thức',
        ksnk_6_1: '6.1 Xử lý chất thải sinh hoạt',
        ksnk_6_2: '6.2 Xử lý chất thải y tế',
        ksnk_V_5: 'V.5 Kiểm soát nhiễm khuẩn',
        duoc_7_1: '7.1 Giấy phép bức xạ',
        duoc_7_2: '7.2 Phân công ATBX',
        duoc_7_3: '7.3 Chứng chỉ NVBX',
        duoc_7_4: '7.4 Liều kế',
        duoc_IV_1: 'IV.1 Hồ sơ thiết bị',
        duoc_IV_2: 'IV.2 Quy chế QLSD',
        duoc_IV_3: 'IV.3 Quy trình vận hành',
        duoc_IV_4: 'IV.4 Kiểm định/hiệu chuẩn',
        duoc_IV_5: 'IV.5 Bộ phận & nhân sự',
        kehoach_V_1: 'V.1 Trực 24/24',
        kehoach_V_2: 'V.2 QT ngoại trú',
        kehoach_V_3_1: 'V.3.1 PB QTKT',
        kehoach_V_3_2: 'V.3.2 PB HDCĐ-ĐT',
        kehoach_V_3_3: 'V.3.3 AD QTKT',
        kehoach_V_3_4: 'V.3.4 AD HDCĐ-ĐT',
        kehoach_V_3_5: 'V.3.5 Tuân thủ kê đơn',
        kehoach_V_4_1: 'V.4.1 HT QLCL',
        kehoach_V_4_2: 'V.4.2 QC HĐ QLCL',
        kehoach_V_4_3: 'V.4.3 KH cải tiến CL',
        kehoach_V_4_4: 'V.4.4 Chỉ số CL',
        kehoach_V_4_5: 'V.4.5 QLCL XN',
        kehoach_V_4_6: 'V.4.6 BC sự cố y khoa'
    };

    let csv = '';
    const header = [
        'STT',
        'Loại phiếu',
        'Tên bệnh viện',
        'Người đánh giá',
        'Ngày',
        'Ghi chú',
        ...CRITERIA.map(k => CRITERIA_LABELS[k] || k)
    ];
    csv += header.map(escapeCsv).join(',') + '\n';

    list.forEach((item, index) => {
        const row = [
            index + 1,
            modeLabel(item.mode),
            item.hospital || '',
            item.evaluator || '',
            item.date || '',
            item.notes || '',
            ...CRITERIA.map(k => item[k] || '')
        ];
        csv += row.map(escapeCsv).join(',') + '\n';
    });
    
    // Tạo file và download
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `du_lieu_tim_kiem_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    alert('✅ Đã xuất dữ liệu thành công!');
}

// Định dạng số
function formatNumber(num) {
    return new Intl.NumberFormat('vi-VN').format(num);
}

// Định dạng ngày
function formatDate(dateString) {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('vi-VN');
}

// =========================
// HỖ TRỢ ĐỌC FILE EXCEL MẪU
// =========================

// Khởi tạo giao diện mẫu Excel khi trang load
function initTemplateUI() {
    const fixedFields = document.getElementById('fixed-fields');
    const templateFieldsContainer = document.getElementById('template-fields');
    const templateInfo = document.getElementById('template-info');

    if (!fixedFields || !templateFieldsContainer || !templateInfo) return;

    if (isTemplateMode()) {
        // Ẩn form cố định, hiện form động
        fixedFields.style.display = 'none';
        templateFieldsContainer.style.display = 'block';
        buildTemplateFields();

        templateInfo.innerHTML = `
            <div>
                <span class="template-badge">Đang sử dụng mẫu Excel</span>
                <div>Danh sách cột (lấy từ dòng tiêu đề của file):</div>
                <ul>
                    ${templateHeaders.map(h => `<li>${h}</li>`).join('')}
                </ul>
            </div>
        `;
    } else {
        // Chưa có mẫu Excel -> dùng form cố định
        fixedFields.style.display = 'block';
        templateFieldsContainer.style.display = 'none';
        templateInfo.innerHTML = '';
    }
}

// Xử lý khi người dùng chọn file Excel mẫu
function handleTemplateUpload(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = function(e) {
        try {
            const dataBinary = e.target.result;
            const workbook = XLSX.read(dataBinary, { type: 'binary' });

            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];

            // Đọc toàn bộ sheet dưới dạng mảng các dòng, mỗi dòng là mảng ô
            const sheetData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

            if (!sheetData || sheetData.length === 0) {
                alert('File Excel không có dữ liệu.');
                return;
            }

            // Tìm dòng đầu tiên có ít nhất một ô khác rỗng -> coi là dòng tiêu đề
            let headerRow = sheetData.find(row => Array.isArray(row) && row.some(cell => (cell || '').toString().trim() !== ''));
            if (!headerRow) {
                alert('Không tìm thấy dòng tiêu đề trong file Excel.');
                return;
            }

            // Lấy danh sách tiêu đề, loại bỏ các ô trống ở cuối
            templateHeaders = headerRow
                .map(cell => (cell || '').toString().trim())
                .filter(cell => cell !== '');

            if (!templateHeaders.length) {
                alert('Dòng tiêu đề không có cột hợp lệ.');
                return;
            }

            // Lưu cấu hình vào localStorage
            localStorage.setItem('templateHeaders', JSON.stringify(templateHeaders));

            // Cập nhật giao diện
            initTemplateUI();
            loadData();
            updateStatistics();

            alert('✅ Đã đọc mẫu Excel thành công. Bạn có thể bắt đầu nhập liệu theo đúng các cột trong file.');
        } catch (err) {
            console.error(err);
            alert('Không thể đọc file Excel. Vui lòng kiểm tra lại file (định dạng .xlsx/.xls).');
        }
    };

    reader.onerror = function() {
        alert('Lỗi khi đọc file Excel.');
    };

    reader.readAsBinaryString(file);
}

// Sinh các ô nhập liệu động từ danh sách tiêu đề cột
function buildTemplateFields() {
    const container = document.getElementById('template-fields');
    if (!container || !isTemplateMode()) return;

    container.innerHTML = '';

    templateHeaders.forEach((header, index) => {
        const group = document.createElement('div');
        group.className = 'form-group';

        const label = document.createElement('label');
        label.textContent = header;

        const input = document.createElement('input');
        input.type = 'text';
        input.id = `template-field-${index}`;
        input.placeholder = `Nhập ${header.toLowerCase()}`;

        group.appendChild(label);
        group.appendChild(input);
        container.appendChild(group);
    });
}
