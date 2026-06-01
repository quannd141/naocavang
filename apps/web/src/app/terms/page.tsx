import type { Metadata } from 'next';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { LegalShell } from '@/components/legal/legal-shell';

export const metadata: Metadata = {
  title: 'Điều khoản sử dụng — Não Cá Vàng',
  description: 'Điều khoản và điều kiện khi sử dụng nền tảng Não Cá Vàng.',
};

export default function TermsPage() {
  return (
    <>
      <Header />
      <main>
        <LegalShell title="Điều khoản Sử dụng" updatedAt="01/06/2026">
          <p>
            Bằng việc tạo tài khoản hoặc sử dụng Não Cá Vàng, bạn đồng ý với các điều khoản dưới đây.
            Vui lòng đọc kỹ.
          </p>

          <h2>1. Tài khoản</h2>
          <ul>
            <li>Bạn chịu trách nhiệm bảo mật thông tin đăng nhập và mọi hoạt động trong tài khoản.</li>
            <li>Bạn cam kết cung cấp thông tin chính xác khi đăng ký.</li>
          </ul>

          <h2>2. Sử dụng được phép</h2>
          <p>Bạn đồng ý không:</p>
          <ul>
            <li>Dùng nền tảng cho mục đích vi phạm pháp luật hoặc xâm phạm quyền của người khác.</li>
            <li>Tải lên nội dung vi phạm bản quyền, bạo lực, thù ghét hoặc bất hợp pháp.</li>
            <li>Cố gắng phá hoại, dò quét lỗ hổng, hoặc lạm dụng hạn mức (quota) hệ thống.</li>
          </ul>

          <h2>3. Nội dung của bạn</h2>
          <p>
            Bạn giữ quyền sở hữu nội dung học tập do mình tạo ra. Khi bật chế độ "công khai", bạn cho
            phép người dùng khác xem và sao chép nội dung đó. Bạn có thể tắt công khai bất cứ lúc nào.
          </p>

          <h2>4. Dịch vụ AI</h2>
          <p>
            Các tính năng AI (sinh mind map, flashcard, quiz, gia sư) có thể tạo ra nội dung chưa
            chính xác tuyệt đối. Bạn nên tự kiểm chứng thông tin quan trọng. Hạn mức sử dụng Ai phụ
            thuộc gói dịch vụ của bạn.
          </p>

          <h2>5. Gói trả phí</h2>
          <p>
            Một số tính năng yêu cầu gói trả phí (Premium/Pro). Chi tiết về giá và hoàn tiền được nêu
            tại trang Giá và Chính sách hoàn tiền.
          </p>

          <h2>6. Giới hạn trách nhiệm</h2>
          <p>
            Nền tảng được cung cấp "nguyên trạng". Trong phạm vi pháp luật cho phép, chúng tôi không
            chịu trách nhiệm với thiệt hại gián tiếp phát sinh từ việc sử dụng dịch vụ.
          </p>

          <h2>7. Thay đổi điều khoản</h2>
          <p>
            Chúng tôi có thể cập nhật điều khoản này. Thay đổi quan trọng sẽ được thông báo qua email
            hoặc trên nền tảng.
          </p>

          <h2>8. Liên hệ</h2>
          <p>
            Câu hỏi về điều khoản, vui lòng liên hệ:{' '}
            <a href="mailto:hello@naocavang.vn">hello@naocavang.vn</a>.
          </p>
        </LegalShell>
      </main>
      <Footer />
    </>
  );
}
