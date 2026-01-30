# 📊 Tiêu chí Chất lượng cơ bản  
# Bệnh viện Sức khỏe Tâm thần BR-VT

Ứng dụng web để nhập liệu, quản lý và thống kê **tiêu chuẩn chất lượng cơ bản** cho **Bệnh viện Sức Khỏe Tâm thần BR-VT**.

## ✨ Tính năng

### 📝 Nhập liệu
- Form nhập liệu với các trường:
  - Tên/Mã số
  - Danh mục (Loại A, B, C, D)
  - Giá trị (số)
  - Ngày
  - Ghi chú (tùy chọn)
- Tự động lưu vào trình duyệt (localStorage)
- Xóa form nhanh chóng

### 📈 Thống kê
- **Tổng số bản ghi**: Số lượng dữ liệu đã nhập
- **Tổng giá trị**: Tổng của tất cả giá trị
- **Giá trị trung bình**: Giá trị trung bình của tất cả bản ghi
- **Bản ghi hôm nay**: Số lượng bản ghi được nhập trong ngày
- **Biểu đồ tròn**: Thống kê theo danh mục
- **Biểu đồ đường**: Giá trị theo thời gian
- **Top 10**: 10 giá trị cao nhất

### 📋 Quản lý dữ liệu
- Xem danh sách tất cả dữ liệu
- Tìm kiếm theo tên hoặc ghi chú
- Lọc theo danh mục
- Sửa dữ liệu đã nhập
- Xóa từng bản ghi hoặc xóa tất cả
- Xuất dữ liệu ra file CSV (Excel)

## 🚀 Cách sử dụng

### Khởi chạy ứng dụng

1. Mở file `index.html` trong trình duyệt web (Chrome, Firefox, Edge, Safari...)
2. Không cần cài đặt thêm gì cả - ứng dụng chạy hoàn toàn trên trình duyệt!

### Nhập dữ liệu

1. Chuyển sang tab **"Nhập liệu"**
2. Điền đầy đủ thông tin:
   - Tên/Mã số: Nhập tên hoặc mã số định danh
   - Danh mục: Chọn loại từ dropdown
   - Giá trị: Nhập số (có thể là số thập phân)
   - Ngày: Chọn ngày (mặc định là hôm nay)
   - Ghi chú: Nhập thêm thông tin (không bắt buộc)
3. Click **"Lưu dữ liệu"**
4. Dữ liệu sẽ được lưu tự động và bạn có thể xem trong tab **"Dữ liệu"**

### Xem thống kê

1. Chuyển sang tab **"Thống kê"**
2. Xem các chỉ số tổng quan ở phía trên
3. Xem biểu đồ tròn để phân tích theo danh mục
4. Xem biểu đồ đường để theo dõi xu hướng theo thời gian
5. Xem Top 10 giá trị cao nhất

### Quản lý dữ liệu

1. Chuyển sang tab **"Dữ liệu"**
2. Sử dụng ô tìm kiếm để tìm theo tên hoặc ghi chú
3. Chọn danh mục từ dropdown để lọc
4. Click **"Sửa"** để chỉnh sửa một bản ghi
5. Click **"Xóa"** để xóa một bản ghi
6. Click **"Xuất Excel"** để tải file CSV về máy
7. Click **"Xóa tất cả"** để xóa toàn bộ dữ liệu (cẩn thận!)

## 💾 Lưu trữ dữ liệu

- Dữ liệu được lưu trữ trong **localStorage** của trình duyệt
- Dữ liệu sẽ được giữ lại ngay cả khi đóng trình duyệt
- Mỗi trình duyệt/thiết bị có dữ liệu riêng biệt
- Để sao lưu, sử dụng tính năng **"Xuất Excel"**

## 📁 Cấu trúc file

```
.
├── index.html      # File HTML chính
├── styles.css      # File CSS cho styling
├── script.js       # File JavaScript cho logic
└── README.md       # File hướng dẫn này
```

## 🎨 Giao diện

- Thiết kế hiện đại với gradient màu tím/xanh
- Responsive - hoạt động tốt trên cả máy tính và điện thoại
- Giao diện thân thiện, dễ sử dụng
- Biểu đồ trực quan với Chart.js

## 🔧 Yêu cầu

- Trình duyệt web hiện đại (Chrome, Firefox, Edge, Safari...)
- Kết nối internet để tải Chart.js (hoặc có thể tải về và dùng offline)

## 📝 Lưu ý

- Dữ liệu chỉ lưu trên trình duyệt hiện tại
- Nếu xóa cache trình duyệt, dữ liệu sẽ bị mất
- Nên xuất dữ liệu định kỳ để sao lưu
- File CSV có thể mở bằng Excel, Google Sheets, hoặc bất kỳ phần mềm bảng tính nào

## 🆘 Hỗ trợ

Nếu gặp vấn đề:
1. Kiểm tra console của trình duyệt (F12) để xem lỗi
2. Đảm bảo JavaScript được bật trong trình duyệt
3. Thử làm mới trang (F5)
4. Kiểm tra xem localStorage có bị chặn không

## 📄 License

Tự do sử dụng cho mục đích cá nhân và thương mại.

---

**Chúc bạn sử dụng hiệu quả!** 🎉
