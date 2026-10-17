import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();

test('PARAMSATHYA-PROFILE-001: Active User Profile & Vault Deletion Suite', async (t) => {
  const presencePageSrc = readFileSync(join(ROOT, 'app/experience/presence/page.tsx'), 'utf-8');
  const userModalSrc = readFileSync(join(ROOT, 'components/UserProfileModal.tsx'), 'utf-8');
  const evidenceDrawerSrc = readFileSync(join(ROOT, 'components/EvidenceDrawer.tsx'), 'utf-8');
  const mindMapSrc = readFileSync(join(ROOT, 'components/InteractiveMindMap.tsx'), 'utf-8');
  const mobileBarSrc = readFileSync(join(ROOT, 'components/mobile/MobileAppBar.tsx'), 'utf-8');
  const mobileMoreSrc = readFileSync(join(ROOT, 'components/mobile/MobileMoreSheet.tsx'), 'utf-8');

  await t.test('USER-001: UserProfileModal exists and handles photo update + presets', () => {
    assert.ok(userModalSrc.includes('ActiveUserProfile'), 'Exports ActiveUserProfile interface');
    assert.ok(userModalSrc.includes('handleFileUpload'), 'Provides file upload handler for custom photos');
    assert.ok(userModalSrc.includes('PRESET_AVATARS'), 'Provides curated family avatar presets');
    assert.ok(userModalSrc.includes('paramsathya_user_profile_v1') || userModalSrc.includes('onSaveProfile'), 'Saves profile changes to parent callback');
  });

  await t.test('USER-002: Desktop header user avatar button opens UserProfileModal', () => {
    assert.ok(presencePageSrc.includes('setIsUserProfileModalOpen(true)'), 'Header avatar wires to setIsUserProfileModalOpen');
    assert.ok(presencePageSrc.includes('src={userProfile.avatarUrl}'), 'Header avatar renders dynamic userProfile.avatarUrl');
    assert.ok(presencePageSrc.includes('paramsathya_user_profile_v1'), 'Hydrates userProfile from localStorage on mount');
    assert.ok(presencePageSrc.includes('handleSaveUserProfile'), 'Defines handleSaveUserProfile syncing to state and localStorage');
  });

  await t.test('USER-003: Mobile header & more sheet wire to UserProfileModal', () => {
    assert.ok(mobileBarSrc.includes('onOpenUserProfile'), 'MobileAppBar exposes onOpenUserProfile prop');
    assert.ok(mobileBarSrc.includes('userAvatarUrl'), 'MobileAppBar displays userAvatarUrl');
    assert.ok(mobileMoreSrc.includes('onOpenUserProfile'), 'MobileMoreSheet exposes onOpenUserProfile');
    assert.ok(mobileMoreSrc.includes('userAvatarUrl'), 'MobileMoreSheet displays user profile card');
  });

  await t.test('DEL-001: Photos Vault provides logical delete action with Trash icon', () => {
    assert.ok(presencePageSrc.includes('handleDeletePhoto'), 'Presence page defines handleDeletePhoto');
    assert.ok(presencePageSrc.includes('handleDeletePhoto(photo.id'), 'Photo card renders delete button calling handleDeletePhoto');
    assert.ok(presencePageSrc.includes('setUploadedPhotos((prev) => prev.filter'), 'Filters photo from uploadedPhotos state array');
  });

  await t.test('DEL-002: Audio Voice Vault provides logical delete action with playback teardown', () => {
    assert.ok(presencePageSrc.includes('handleDeleteAudio'), 'Presence page defines handleDeleteAudio');
    assert.ok(presencePageSrc.includes('handleDeleteAudio(audio.id'), 'Audio card renders delete button calling handleDeleteAudio');
    assert.ok(presencePageSrc.includes('stopAllAudio()'), 'Tears down and halts playing audio when active clip is deleted');
    assert.ok(presencePageSrc.includes('setUploadedAudioVault((prev) => prev.filter'), 'Filters audio from uploadedAudioVault state array');
  });

  await t.test('DEL-003: Memory Constellation & EvidenceDrawer support memory deletion', () => {
    assert.ok(presencePageSrc.includes('handleDeleteMemory'), 'Presence page defines handleDeleteMemory');
    assert.ok(evidenceDrawerSrc.includes('onDeleteMemory'), 'EvidenceDrawer accepts onDeleteMemory prop');
    assert.ok(evidenceDrawerSrc.includes('<Trash'), 'EvidenceDrawer renders Trash icon for memory record deletion');
    assert.ok(mindMapSrc.includes('onDeleteMemory'), 'InteractiveMindMap passes onDeleteMemory to list view cards and EvidenceDrawer');
  });

  await t.test('DEL-004: Connected Circle provides logical member deletion', () => {
    assert.ok(presencePageSrc.includes('handleDeleteCircleMember'), 'Presence page defines handleDeleteCircleMember');
    assert.ok(presencePageSrc.includes('member.role !== \'Owner\''), 'Prevents deleting the circle Owner');
    assert.ok(presencePageSrc.includes('setCircleMembers((prev) => prev.filter'), 'Removes non-owner member from circleMembers state');
  });
});
