# IMPORTANT.md — SỔ TAY HƯỚNG DẪN & QUY TẮC QUAN TRỌNG DỰ ÁN NEXTGEN WOMEN HOOPS

Tài liệu này tổng hợp **toàn bộ những điều cốt lõi, kiến trúc hệ thống, quy tắc vàng và các lưu ý quan trọng nhất** mà bất kỳ ai làm việc trên dự án **NextGen Women Hoops** đều phải nắm vững.

---

## 🎯 1. TỔNG QUAN DỰ ÁN

- **Tên dự án**: NextGen Women Hoops (Hệ thống Thông tin & Giải đấu Bóng Rổ Nữ).
- **Mục tiêu**: Nền tảng Full-Stack phục vụ công bố thông tin giải đấu, danh sách Câu lạc bộ (Clubs), lịch thi đấu & kết quả (Matches), bảng xếp hạng (Standings), tin tức (News), thư viện ảnh (Gallery) và tính năng đăng ký CLB trực tuyến (Club Registration).
- **Đa ngôn ngữ**: Hỗ trợ song ngữ **Tiếng Anh (EN)** và **Tiếng Việt (VI)** trên từng trang (`next-intl`).

---

## 🏗️ 2. KIẾN TRÚC HỆ THỐNG (ARCHITECTURE STACK)

| Thành phần | Công nghệ / Lựa chọn | Lý do & Quy định |
| :--- | :--- | :--- |
| **Framework Full-Stack** | **Next.js 16 (App Router)** | Đảm nhận cả **Frontend SSR/SSG** và **Backend API Route Handlers**. |
| **Language** | **TypeScript** | Đóng gói kiểu dữ liệu chặt chẽ từ API, Repositories đến UI Components. |
| **Styling** | **SCSS / SCSS Modules** | **CỐ ĐỊNH**. KHÔNG dùng TailwindCSS hay Shadcn/ui (`RULES.md` R016/R021). |
| **Backend & API** | **Next.js App Router API Routes** | Thay thế hoàn toàn Django/DRF. Chạy theo mô hình **Modular Monolith**. |
| **Database** | **PostgreSQL 16** | Kết nối trực tiếp từ Next.js Server qua thư viện `pg` (Connection Pool). |
| **Containerization** | **Docker & Docker Compose** | Chạy 2 service: `frontend` (Next.js) và `postgres` (PostgreSQL). |
| **Testing** | **Jest & React Testing Library** | Unit testing cho cả Frontend components và Backend server services. |

---

## 📍 3. BACKEND HẠ TẦNG HIỆN TẠI NẰM Ở ĐÂU?

> ⚠️ **LƯU Ý QUAN TRỌNG**: Bộ mã nguồn Django (`backend/` cũ) và container Python đã được **GỠ BỎ HOÀN TOÀN (DECOMMISSIONED)**. Dự án hiện tại là Full-Stack Next.js 100%.

Các thành phần Backend nằm tại thư mục `root-NGWH/`:

- **API Route Handlers**: `root-NGWH/src/app/api/`
  - `GET /api/health`: Kiểm tra kết nối CSDL PostgreSQL.
  - `GET /api/clubs` & `GET /api/clubs/[id]`: Truy vấn danh sách & chi tiết CLB đã được duyệt (`is_approved = true`).
  - `POST /api/clubs`: Xử lý form đăng ký CLB mới & upload file.
  - `GET /api/seasons`: Lấy danh sách các mùa giải.
  - `GET /api/matches`: Lấy lịch thi đấu & kết quả.
- **Static Media Handler**: `root-NGWH/src/app/media/[...path]/route.ts` (Phục vụ tài liệu PDF/ảnh upload).
- **Server Services (Logic nghiệp vụ)**: `root-NGWH/src/server/services/`
- **Repositories (Truy vấn SQL)**: `root-NGWH/src/server/repositories/`
- **Validation**: `root-NGWH/src/server/validation/`

---

## 🛑 4. CÁC QUY TẮC VÀNG (CRITICAL RULES - BẮT BUỘC TUÂN THỦ)

1. **Tuyệt đối KHÔNG TỰ BỊA / KHÔNG TỰ ĐOÁN (Never Invent Rule - `RULES.md` R004/R006)**:
   - Không tự bịa số điện thoại, email, địa chỉ office thật nếu chưa được phía Stakeholder xác nhận. Dùng chuỗi **Placeholder rõ ràng** (ví dụ: `"[Office address will be updated]"`).
2. **Quy tắc xử lý Câu hỏi mở (Open Questions Policy - `RULES.md` R005)**:
   - Các tính năng bị vướng Câu hỏi mở (OQ) chưa được trả lời (ví dụ `REQ-CONTACT-002` dính `OQ-014` về contact form backend) **PHẢI ĐƯỢC GIỮ NGUYÊN trạng thái Blocked**. Tuyệt đối không tự chọn phương án xử lý backend thay cho khách hàng.
3. **Bảo mật Ranh giới CSDL (Database Boundary - `RULES.md` R018)**:
   - Trình duyệt (Client Component) **KHÔNG ĐƯỢC KẾT NỐI TRỰC TIẾP** tới PostgreSQL. Mọi thao tác ghi/đọc CSDL bắt buộc chạy qua Server Components, Server Actions hoặc API Route Handlers.
4. **Đa Ngôn Ngữ (i18n)**:
   - Mọi văn bản hiển thị phải qua `en.json` và `vi.json`.
   - Luôn test giao diện khi chuyển locale EN/VI để tránh vỡ khung hoặc vỡ chữ trên Header/Navigation.

---

## 🧪 5. QUY TRÌNH KIỂM THỬ (VERIFICATION LOOP)

Trước khi báo hoàn thành công việc hoặc commit code, **BẮT BUỘC** thực hiện đầy đủ 4 bước kiểm tra sau tại thư mục `root-NGWH/`:

```bash
cd root-NGWH

# 1. Kiểm tra kiểu TypeScript (Phải 0 lỗi)
npx tsc --noEmit

# 2. Kiểm tra chuẩn code ESLint (Phải 0 lỗi)
npm run lint

# 3. Chạy bộ unit tests Jest (174 tests - Phải PASS 100%)
npm test

# 4. Biên dịch thử bản Production (Phải SUCCESS 100%)
npm run build
```

---

## 🚀 6. COMMAND CHEAT SHEET (MÔI TRƯỜNG DOCKER)

```bash
# Khởi động toàn bộ môi trường (Next.js + PostgreSQL)
docker compose up -d --build

# Xem log các container
docker compose logs -f

# Tắt môi trường Docker
docker compose down

# Chạy test trong thư mục root-NGWH
cd root-NGWH && npm test
```

---

## 📋 7. CÁC TÀI LIỆU CẦN THAM KHẢO TRONG REPOSITORY

- `.ai/RULES.md`: Chi tiết các quy tắc cứng của dự án.
- `.ai/ARCHITECTURE.md`: Tài liệu kiến trúc HLD.
- `.ai/REQUIREMENTS.md`: Danh sách Yêu cầu & Trạng thái OQ.
- `.ai/IMPLEMENTATION_STATUS.md`: Trạng thái thực thi công việc.
- `.ai/lld/*.md`: Tài liệu LLD chi tiết từng tính năng.
