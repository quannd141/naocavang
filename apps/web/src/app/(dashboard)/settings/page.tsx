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
import { Download } from 'lucide-react';
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

  // Export state
  const [exporting, setExporting] = useState(false);
  const [exportMsg, setExportMsg] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);

  // Delete account state
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [deleteMsg, setDeleteMsg] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);

  async function deleteAccount(e: React.FormEvent) {
    e.preventDefault();
    if (deleteConfirmText.trim().toUpperCase() !== 'XOA') {
      setDeleteMsg({ kind: 'err', text: 'Gõ chính xác "XOA" để xác nhận' });
      return;
    }
    setDeletingAccount(true);
    setDeleteMsg(null);
    try {
      await userApi.deleteAccount({ password: deletePassword || undefined });
      clearApiToken();
      setDeleteMsg({ kind: 'ok', text: 'Đã xoá tài khoản. Đang đưa bạn về trang chủ...' });
      setTimeout(() => router.push('/'), 1500);
    } catch (err) {
      setDeleteMsg({
        kind: 'err',
        text: err instanceof ApiError ? err.message : (err as Error).message,
      });
      setDeletingAccount(false);
    }
  }

  async function handleExport() {
    setExporting(true);
    setExportMsg(null);
    try {
      const bundle = await userApi.exportData();
      const blob = new Blob([JSON.stringify(bundle, null, 2)], {
        type: 'application/json;charset=utf-8',
      });
      const stamp = new Date().toISOString().slice(0, 10);
      const filename = `nao-ca-vang-export-${stamp}.json`;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setExportMsg({
        kind: 'ok',
        text: `Đã tải về ${filename} — ${bundle.mindmaps.length} mindmaps, ${bundle.flashcardDecks.length} decks, ${bundle.quizzes.length} quizzes.`,
      });
    } catch (err) {
      setExportMsg({
        kind: 'err',
        text: err instanceof ApiError ? err.message : (err as Error).message,
      });
    } finally {
      setExporting(false);
    }
  }

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

        {/* Data portability + danger zone */}
        <Card>
          <CardHeader>
            <CardTitle>Dữ liệu của bạn</CardTitle>
            <CardDescription>Theo Nghị định 13/2023 PDPA — bạn có quyền tải về dữ liệu</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="min-w-0">
                <div className="font-medium">Export dữ liệu</div>
                <div className="text-sm text-muted-foreground">
                  Tải về JSON bundle: tất cả mind map, deck, quiz, attempts.
                </div>
              </div>
              <Button variant="outline" onClick={handleExport} disabled={exporting}>
                <Download className="h-4 w-4" /> {exporting ? 'Đang tải...' : 'Export JSON'}
              </Button>
            </div>
            {exportMsg && (
              <div className={`text-sm ${exportMsg.kind === 'ok' ? 'text-green-700' : 'text-red-700'}`}>
                {exportMsg.kind === 'ok' ? '✓ ' : '⚠️ '}
                {exportMsg.text}
              </div>
            )}
            <hr className="my-3 border-border" />
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="min-w-0">
                <div className="font-medium text-red-700">Xoá tài khoản</div>
                <div className="text-sm text-muted-foreground">
                  Xoá vĩnh viễn cùng toàn bộ mind map, deck, quiz, attempt. Không khôi phục được.
                </div>
              </div>
              {!deleteOpen && (
                <Button
                  variant="destructive"
                  onClick={() => {
                    setDeleteOpen(true);
                    setDeleteMsg(null);
                  }}
                >
                  Xoá tài khoản
                </Button>
              )}
            </div>
            {deleteOpen && (
              <form
                onSubmit={deleteAccount}
                className="mt-3 space-y-3 rounded-md border border-red-300 bg-red-50 p-4"
              >
                <p className="text-sm text-red-800">
                  ⚠️ Hành động này <strong>không thể hoàn tác</strong>. Khuyến nghị Export JSON trước.
                </p>
                <div className="space-y-2">
                  <Label htmlFor="deletePassword">Mật khẩu (bắt buộc nếu tài khoản có mật khẩu)</Label>
                  <Input
                    id="deletePassword"
                    type="password"
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    disabled={deletingAccount}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deleteConfirm">
                    Gõ <strong>XOA</strong> để xác nhận
                  </Label>
                  <Input
                    id="deleteConfirm"
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    disabled={deletingAccount}
                    required
                  />
                </div>
                {deleteMsg && (
                  <div
                    className={`text-sm ${
                      deleteMsg.kind === 'ok' ? 'text-green-700' : 'text-red-700'
                    }`}
                  >
                    {deleteMsg.kind === 'ok' ? '✓ ' : '⚠️ '}
                    {deleteMsg.text}
                  </div>
                )}
                <div className="flex gap-2">
                  <Button type="submit" variant="destructive" disabled={deletingAccount}>
                    {deletingAccount ? 'Đang xoá...' : 'Xoá vĩnh viễn'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={deletingAccount}
                    onClick={() => {
                      setDeleteOpen(false);
                      setDeletePassword('');
                      setDeleteConfirmText('');
                      setDeleteMsg(null);
                    }}
                  >
                    Huỷ
                  </Button>
                </div>
              </form>
            )}
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
