import type { Metadata } from 'next';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { LegalShell } from '@/components/legal/legal-shell';

export const metadata: Metadata = {
  title: 'Chính sách quyền riêng tư — Não Cá Vàng',
  description: 'Cách Não Cá Vàng thu thập, sử dụng và bảo vệ dữ liệu cá nhân của bạn.',
};

export default function PrivacyPage() {
  return (
    <>
      <Header />
      <main>
        <LegalShell title="Chính sách Quyền riêng tư" updatedAt="01/06/2026">
          <p>
            Não Cá Vàng ("chúng tôi") tôn trọng quyền riêng tư của bạn. Chính sách này mô tả cách
            chúng tôi thu thập, sử dụng và bảo vệ dữ liệu cá nhân khi bạn dùng nền tảng, phù hợp với
            Nghị định 13/2023/NĐ-CP về bảo vệ dữ liệu cá nhân.
          </p>

          <h2>1. Dữ liệu chúng tôi thu thập</h2>
          <ul>
            <li><strong>Thông tin tài khoản</strong>: email, tên, mật khẩu (đã mã hoá), hoặc thông tin từ đăng nhập Google.</li>
            <li><strong>Nội dung học tập</strong>: mind map, flashcard, quiz, lịch sử ôn tập bạn tạo ra.</li>
            <li><strong>Dữ liệu sử dụng</strong>: số lượt dùng AI, thời điểm ôn tập, để vận hành tính năng và quota.</li>
            <li><strong>Cookie kỹ thuật</strong>: chỉ cookie cần thiết để duy trì phiên đăng nhập (xem mục 7).</li>
          </ul>

          <h2>2. Mục đích sử dụng</h2>
          <ul>
            <li>Cung cấp và vận hành các tính năng học tập (mind map, flashcard, quiz, AI tutor).</li>
            <li>Cá nhân hoá trải nghiệm: nhắc ôn tập theo lịch spaced repetition, thống kê tiến độ.</li>
            <li>Đảm bảo an toàn, chống lạm dụng và quản lý hạn mức (quota) sử dụng AI.</li>
          </ul>

          <h2>3. Chia sẻ dữ liệu với bên thứ ba</h2>
          <p>
            Chúng tôi chỉ chia sẻ dữ liệu tối thiểu cần thiết với các nhà cung cấp dịch vụ hạ tầng
            (ví dụ: nhà cung cấp AI để xử lý yêu cầu, dịch vụ lưu trữ, gửi email). Chúng tôi
            <strong> không bán</strong> dữ liệu cá nhân của bạn.
          </p>

          <h2>4. Lưu trữ &amp; bảo mật</h2>
          <p>
            Mật khẩu được băm (hash). Dữ liệu được lưu trên hạ tầng có kiểm soát truy cập. Chúng tôi
            áp dụng các biện pháp kỹ thuật hợp lý để bảo vệ dữ liệu, dù không hệ thống nào an toàn
            tuyệt đối.
          </p>

          <h2>5. Quyền của bạn</h2>
          <ul>
            <li><strong>Truy cập &amp; xuất dữ liệu</strong>: tải toàn bộ dữ liệu của bạn dưới dạng JSON trong phần Cài đặt.</li>
            <li><strong>Xoá tài khoản</strong>: xoá vĩnh viễn tài khoản và dữ liệu liên quan trong phần Cài đặt.</li>
            <li><strong>Chỉnh sửa</strong>: cập nhật thông tin cá nhân bất cứ lúc nào.</li>
          </ul>

          <h2>6. Trẻ vị thành niên</h2>
          <p>
            Nền tảng hướng tới học sinh, sinh viên. Người dùng dưới 16 tuổi nên có sự đồng ý của
            phụ huynh/người giám hộ theo quy định pháp luật.
          </p>

          <h2>7. Cookie</h2>
          <p>
            Chúng tôi chỉ dùng cookie/lưu trữ cục bộ ở mức cần thiết để duy trì đăng nhập và ghi nhớ
            lựa chọn của bạn. Chúng tôi không dùng cookie quảng cáo theo dõi xuyên trang.
          </p>

          <h2>8. Liên hệ</h2>
          <p>
            Mọi yêu cầu về dữ liệu cá nhân, vui lòng liên hệ:{' '}
            <a href="mailto:privacy@naocavang.vn">privacy@naocavang.vn</a>.
          </p>
        </LegalShell>
      </main>
      <Footer />
    </>
  );
}
