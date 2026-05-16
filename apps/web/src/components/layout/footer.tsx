import Link from 'next/link';

const FOOTER_SECTIONS = [
  {
    title: 'Sản phẩm',
    links: [
      { href: '/#features', label: 'Tính năng' },
      { href: '/#pricing', label: 'Giá' },
      { href: '/library', label: 'Templates' },
      { href: '/changelog', label: 'Cập nhật' },
    ],
  },
  {
    title: 'Công ty',
    links: [
      { href: '/about', label: 'Về Não Cá Vàng' },
      { href: '/blog', label: 'Blog' },
      { href: '/careers', label: 'Tuyển dụng' },
      { href: '/contact', label: 'Liên hệ' },
    ],
  },
  {
    title: 'Pháp lý',
    links: [
      { href: '/terms', label: 'Điều khoản' },
      { href: '/privacy', label: 'Quyền riêng tư' },
      { href: '/refund', label: 'Hoàn tiền' },
      { href: '/dmca', label: 'DMCA' },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <Link href="/" className="flex items-center gap-2 font-bold text-lg">
              <span className="text-2xl">🧠🐠</span>
              <span>Não Cá Vàng</span>
            </Link>
            <p className="mt-3 text-sm text-muted-foreground">
              Học một lần, nhớ cả đời. Nền tảng AI học tập all-in-one cho người Việt.
            </p>
          </div>

          {FOOTER_SECTIONS.map((section) => (
            <div key={section.title}>
              <h3 className="font-semibold text-sm">{section.title}</h3>
              <ul className="mt-3 space-y-2 text-sm">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-muted-foreground hover:text-foreground transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 border-t border-border pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>© 2026 Quân Nguyễn. Made with 💛 in Vietnam.</p>
          <div className="flex items-center gap-4">
            <a href="https://facebook.com/naocavang" target="_blank" rel="noreferrer" className="hover:text-foreground">Facebook</a>
            <a href="https://tiktok.com/@naocavang" target="_blank" rel="noreferrer" className="hover:text-foreground">TikTok</a>
            <a href="mailto:hello@naocavang.vn" className="hover:text-foreground">Email</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
