'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Check } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useMockSession } from '@/lib/mock/use-session';
import { ApiError, clearApiToken, userApi } from '@/lib/api-client';
import { setMockSession } from '@/lib/mock/auth';

const TIERS = [
  { id: 'free', name: 'Free', price: '0đ', features: ['50 AI/tháng', '5 deck', 'AI tutor 20 tin/ngày'] },
  { id: 'premium', name: 'Premium', price: '49.000đ/th', features: ['500 AI/tháng', 'Không giới hạn deck', 'Ưu tiên xử lý'] },
  { id: 'pro', name: 'Pro', price: '149.000đ/th', features: ['5000 AI/tháng', 'Claude Sonnet (cao cấp)', 'Support 1-1'] },
];

export default function SettingsPage() {
  const router = useRouter();
  const { user } = useMockSession();

  // Profile form
  const [name, setName] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);

  // Password form
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPw, setSavingPw] = useState(false);
  const [pwMsg, setPwMsg] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);

  useEffect(() => {
    if (user?.name && name === '') setName(user.name);
  }, [user, name]);

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    if (name.trim() === user.name) {
      setProfileMsg({ kind: 'err', text: 'Tên không có thay đổi' });
      return;
    }
    setSavingProfile(true);
    setProfileMsg(null);
    try {
      const updated = await userApi.updateMe({ name: name.trim() });
      // Sync to local session cache so header/sidebar reflect new name
      setMockSession({
        ...user,
        name: updated.name,
      });
      setProfileMsg({ kind: 'ok', text: 'Đã lưu thay đổi.' });
    } catch (err) {
      setProfileMsg({
        kind: 'err',
        text: err instanceof ApiError ? err.message : (err as Error).message,
      });
    } finally {
      setSavingProfile(false);
    }
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPwMsg({ kind: 'err', text: 'Mật khẩu xác nhận không khớp' });
      return;
    }
    if (newPassword.length < 8) {
      setPwMsg({ kind: 'err', text: 'Mật khẩu mới phải ≥ 8 ký tự' });
      return;
    }
    setSavingPw(true);
    setPwMsg(null);
    try {
      await userApi.changePassword({ oldPassword, newPassword });
      // Backend invalidates all sessions — log user out cleanly.
      clearApiToken();
      setPwMsg({
        kind: 'ok',
        text: 'Đổi mật khẩu thành công. Đang đưa bạn về trang đăng nhập...',
      });
      setTimeout(() => router.push('/login'), 1500);
    } catch (err) {
      setPwMsg({
        kind: 'err',
        text: err instanceof ApiError ? err.message : (err as Error).message,
      });
      setSavingPw(false);
    }
  }

  return (
    <div className="container mx-auto px-4 lg:px-6 py-8 max-w-4xl">
      <PageHeader title="Cài đặt" description="Quản lý tài khoản và gói dịch vụ" />

      <div className="space-y-6">
        {/* Profile */}
        <Card>
          <CardHeader>
            <CardTitle>Thông tin cá nhân</CardTitle>
            <CardDescription>Tên hiển thị trên dashboard và mind map của bạn</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={saveProfile} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Họ tên</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={savingProfile}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={user?.email ?? ''} disabled />
                <p className="text-xs text-muted-foreground">
                  Đổi email cần xác minh — chưa hỗ trợ ở Sprint này.
                </p>
              </div>
              {profileMsg && (
                <div
                  className={`text-sm ${
                    profileMsg.kind === 'ok' ? 'text-green-700' : 'text-red-700'
                  }`}
                >
                  {profileMsg.kind === 'ok' ? '✓ ' : '⚠️ '}
                  {profileMsg.text}
                </div>
              )}
              <Button type="submit" disabled={savingProfile}>
                {savingProfile ? 'Đang lưu...' : 'Lưu thay đổi'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Password */}
        <Card>
          <CardHeader>
            <CardTitle>Đổi mật khẩu</CardTitle>
            <CardDescription>
              Sau khi đổi, các phiên đăng nhập khác sẽ bị huỷ vì lý do bảo mật.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={changePassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="oldPassword">Mật khẩu hiện tại</Label>
                <Input
                  id="oldPassword"
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  disabled={savingPw}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">Mật khẩu mới (≥ 8 ký tự)</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={savingPw}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Xác nhận mật khẩu mới</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={savingPw}
                  required
                />
              </div>
              {pwMsg && (
                <div className={`text-sm ${pwMsg.kind === 'ok' ? 'text-green-700' : 'text-red-700'}`}>
                  {pwMsg.kind === 'ok' ? '✓ ' : '⚠️ '}
                  {pwMsg.text}
                </div>
              )}
              <Button type="submit" disabled={savingPw}>
                {savingPw ? 'Đang đổi...' : 'Đổi mật khẩu'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Tier — view only */}
        <Card id="upgrade">
          <CardHeader>
            <CardTitle>Gói dịch vụ</CardTitle>
            <CardDescription>
              Gói hiện tại: <strong>{user?.tier ?? 'free'}</strong>. Nâng cấp chưa khả dụng ở demo.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            {TIERS.map((tier) => {
              const isCurrent = (user?.tier ?? 'free') === tier.id;
              return (
                <div
                  key={tier.id}
                  className={`rounded-lg border-2 p-4 ${
                    isCurrent ? 'border-brand-500 bg-brand-50' : 'border-border'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold">{tier.name}</h3>
                    {isCurrent && <Badge>Đang dùng</Badge>}
                  </div>
                  <div className="mt-2 text-2xl font-bold">{tier.price}</div>
                  <ul className="mt-3 space-y-1 text-sm">
                    {tier.features.map((f) => (
                      <li key={f} className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-brand-600 mt-0.5 shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  {!isCurrent && (
                    <Button className="mt-4 w-full" size="sm" disabled>
                      Nâng cấp (sắp ra)
                    </Button>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Danger zone — placeholders */}
        <Card>
          <CardHeader>
            <CardTitle>Khu vực nguy hiểm</CardTitle>
            <CardDescription>Các tính năng dưới đây sẽ có ở Sprint sau</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Export dữ liệu</div>
                <div className="text-sm text-muted-foreground">Tải về tất cả mind map, flashcard, quiz</div>
              </div>
              <Button variant="outline" disabled>
                Export JSON (sắp ra)
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-red-700">Xoá tài khoản</div>
                <div className="text-sm text-muted-foreground">
                  Xoá vĩnh viễn theo Nghị định 13/2023 PDPA
                </div>
              </div>
              <Button variant="destructive" disabled>
                Xoá (sắp ra)
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="text-center text-sm text-muted-foreground">
          <Link href="/dashboard" className="hover:underline">
            ← Quay lại Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
