<<<<<<< HEAD
# NutriAI - Hệ sinh thái Dinh dưỡng & Sức khỏe Cá nhân hóa

Dự án hiện tại đang ở giai đoạn **High-Fidelity Prototype** (Giao diện hoàn thiện, Logic giả lập). Để chuyển đổi sang sản phẩm thực tế (Production) hoạt động với dữ liệu thật và thiết bị đeo, dưới đây là danh sách nhiệm vụ (Task List) chi tiết cho từng team.

## 🚀 Nhiệm vụ chi tiết các Team

### 1. Team Backend (Python FastAPI)
*Mục tiêu: Xây dựng hệ thống API thực sự, thay thế toàn bộ Mock Data.*

- [ ] **Authentication System**:
  - Thay thế login giả lập bằng **JWT Authentication** (Login, Register, Refresh Token).
  - Bảo mật password (Hashing với bcrypt).
- [ ] **Core APIs**:
  - `POST /api/meals`: API lưu nhật ký ăn uống vào PostgreSQL.
  - `GET /api/tracking`: API tổng hợp dữ liệu calo/macro theo ngày/tuần.
  - `POST /api/user/profile`: Lưu chỉ số cơ thể (Height, Weight, TDEE) và mục tiêu.
- [ ] **Wearable Integration (Quan trọng)**:
  - Xây dựng Endpoint `POST /api/wearable/sync` nhận dữ liệu JSON từ App Mobile (được đồng bộ từ vòng tay).
  - Xử lý Webhook để nhận dữ liệu từ Apple HealthKit / Google Fit.
  - Thiết kế Schema Time-series (InfluxDB hoặc TimescaleDB) để lưu nhịp tim/bước chân theo thời gian thực.

### 2. Team AI & Data Science
*Mục tiêu: Biến các tính năng "Random" thành trí tuệ nhân tạo thực thụ.*

- [ ] **Nâng cấp Chatbot (Doctor Chat)**:
  - **RAG (Retrieval-Augmented Generation)**: Chatbot phải query được dữ liệu `MealLog` và `HealthMetrics` của user trước khi trả lời.
  - Tích hợp **OpenAI API (GPT-4o)** hoặc **Claude 3.5** thay thế logic `if/else` hiện tại.
  - Prompt Engineering: Tạo Persona "Bác sĩ dinh dưỡng" thân thiện nhưng nghiêm túc về cảnh báo y tế.
- [ ] **Recommendation Engine (Gợi ý món ăn)**:
  - Xây dựng model **Collaborative Filtering**: Gợi ý dựa trên hành vi của user tương đồng.
  - **Context-Aware**: Gợi ý dựa trên ngữ cảnh realtime (VD: Vòng tay báo vừa chạy bộ xong -> Gợi ý món nhiều Carb & Protein để phục hồi).
- [ ] **Wearable Data Analysis (Cho Vòng tay)**:
  - Phát hiện bất thường (Anomaly Detection): Cảnh báo khi nhịp tim tăng cao mà gia tốc kế báo đang ngồi yên (Stress/Caffeine shock).
  - Correlation Analysis: Phân tích mối liên hệ giữa bữa ăn tối hôm trước và chất lượng giấc ngủ hôm sau.
- [ ] **Computer Vision**:
  - Train model nhận diện món ăn Việt Nam (Phở, Bún bò, Cơm tấm...) từ ảnh chụp camera.

### 3. Team Data & Content
*Mục tiêu: Chuẩn hóa dữ liệu đầu vào.*

- [ ] **Cơ sở dữ liệu Thực phẩm (Food DB)**:
  - Mở rộng file `vietnamese_foods.json` từ 60 món lên **2.000+ món** ăn phổ biến tại Việt Nam.
  - Gắn nhãn chi tiết: Calo, Macro (C/P/F), Vi chất (Sắt, Canxi...), Chỉ số GI, Cảnh báo dị ứng (Gluten, Lactose, Hải sản).
- [ ] **CMS Bài viết**:
  - Dựng Headless CMS (Strapi/Contentful) để quản lý bài viết y khoa hiển thị trên App.

### 4. Team Hardware / Embedded (Vòng tay NutriAI)
*Mục tiêu: Sản xuất thiết bị đeo thông minh giá rẻ (Target: 250k).*

- [ ] **Firmware Development**:
  - Đọc cảm biến PPG (Nhịp tim, SpO2) và Accelerometer (Bước chân, Giấc ngủ).
  - Tối ưu năng lượng (Deep Sleep modes) để pin đạt >7 ngày.
- [ ] **Connectivity**:
  - Viết giao thức BLE (Bluetooth Low Energy) để đồng bộ dữ liệu với Mobile App.
  - Cơ chế **Data Buffering**: Lưu dữ liệu vào bộ nhớ Flash khi mất kết nối điện thoại và đồng bộ lại khi có kết nối.

### 5. Team Frontend (ReactJS / Mobile)
*Mục tiêu: Kết nối giao diện với Backend.*

- [ ] **API Integration**: Thay thế toàn bộ biến `const MOCK_DATA` bằng `useEffect` gọi API.
- [ ] **State Management**: Sử dụng React Query hoặc Redux để quản lý dữ liệu server state.
- [ ] **Real-time Updates**: Hiển thị dữ liệu nhịp tim/bước chân ngay lập tức khi Backend nhận được từ vòng tay.

---

## 🛠️ Hướng dẫn Cài đặt (Setup Guide)

### Yêu cầu hệ thống
- Node.js >= 18
- Python >= 3.10
- PostgreSQL

### 1. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Tạo file .env
# OPENAI_API_KEY=sk-...
# DATABASE_URL=postgresql://user:pass@localhost/nutriai

uvicorn main:app --reload
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

---

**© 2029 NutriAI Project - Internal Use Only**
=======
# StartUp
>>>>>>> 8d1045011a0aa4df11e05474c322ef3ae4fbbae9
