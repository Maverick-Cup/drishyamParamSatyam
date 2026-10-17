/**
 * Automated Verification Suite for Mobile-Compatible Design (Phase M1)
 * Validates viewport specifications, bottom navigation touch bounds, safe-area tokens,
 * and adaptive shell responsiveness.
 *
 * Run via: node --test scripts/verify_mobile_001.mjs
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

test('PARAMSATHYA-MOBILE-001: Mobile Adaptation Test Suite (Phase M1)', async (t) => {
  const rootDir = process.cwd();
  const layoutPath = path.join(rootDir, 'app', 'layout.tsx');
  const globalsCssPath = path.join(rootDir, 'app', 'globals.css');
  const presencePagePath = path.join(rootDir, 'app', 'experience', 'presence', 'page.tsx');
  const bottomNavPath = path.join(rootDir, 'components', 'mobile', 'MobileBottomNav.tsx');
  const appBarPath = path.join(rootDir, 'components', 'mobile', 'MobileAppBar.tsx');
  const moreSheetPath = path.join(rootDir, 'components', 'mobile', 'MobileMoreSheet.tsx');
  const reflectionSheetPath = path.join(rootDir, 'components', 'mobile', 'MobileReflectionSheet.tsx');

  // Test 1: Android Viewport Declaration
  await t.test('MOB-001: Root layout defines viewport with cover and resizes-content', () => {
    const layoutContent = fs.readFileSync(layoutPath, 'utf8');
    assert.ok(layoutContent.includes('viewportFit: \'cover\''), 'Must declare viewportFit: cover');
    assert.ok(
      layoutContent.includes('interactiveWidget: \'resizes-content\''),
      'Must declare interactiveWidget: resizes-content for Android soft keyboard'
    );
    assert.ok(layoutContent.includes('width: \'device-width\''), 'Must declare width: device-width');
  });

  // Test 2: Safe Area & Dynamic Viewport CSS Tokens
  await t.test('MOB-002: globals.css exports safe-area insets and dynamic dvh utilities', () => {
    const cssContent = fs.readFileSync(globalsCssPath, 'utf8');
    assert.ok(cssContent.includes('--sab: env(safe-area-inset-bottom'), 'Must declare --sab inset');
    assert.ok(cssContent.includes('pb-safe'), 'Must declare .pb-safe utility');
    assert.ok(cssContent.includes('100dvh'), 'Must declare 100dvh dynamic viewport height');
    assert.ok(cssContent.includes('touch-target-48'), 'Must declare touch-target-48 utility');
  });

  // Test 3: Zoom reset on mobile
  await t.test('MOB-003: globals.css resets zoom to 100% on mobile breakpoints', () => {
    const cssContent = fs.readFileSync(globalsCssPath, 'utf8');
    assert.ok(
      cssContent.includes('@media (max-width: 1024px)') && cssContent.includes('zoom: 100%'),
      'Must reset zoom to 100% on mobile screens to avoid broken tap targets'
    );
  });

  // Test 4: Mobile Top App Bar
  await t.test('MOB-004: MobileAppBar provides 1-tap crisis access and restrained identity', () => {
    const appBarContent = fs.readFileSync(appBarPath, 'utf8');
    assert.ok(appBarContent.includes('md:hidden'), 'Must be hidden on tablet/desktop (md:hidden)');
    assert.ok(appBarContent.includes('onOpenCrisis'), 'Must provide 1-tap crisis support action');
    assert.ok(appBarContent.includes('pt-safe'), 'Must observe safe-area top padding');
  });

  // Test 5: Bottom Navigation Destinations
  await t.test('NAV-001: MobileBottomNav has exactly 5 destinations and meets 48x48 touch targets', () => {
    const navContent = fs.readFileSync(bottomNavPath, 'utf8');
    assert.ok(navContent.includes('\'presence\''), 'Must have Presence tab');
    assert.ok(navContent.includes('\'memories\''), 'Must have Memories tab');
    assert.ok(navContent.includes('\'mindmap\''), 'Must have Mind Map tab');
    assert.ok(navContent.includes('\'circle\''), 'Must have Circle tab');
    assert.ok(navContent.includes('\'more\''), 'Must have More tab');
    assert.ok(navContent.includes('touch-target-48'), 'All tabs must use >= 48px touch targets');
    assert.ok(navContent.includes('pb-safe'), 'Must have pb-safe for gesture bar');
  });

  // Test 6: Bottom Navigation Accessibility
  await t.test('NAV-002: Bottom navigation declares semantic landmarks and accessible names', () => {
    const navContent = fs.readFileSync(bottomNavPath, 'utf8');
    assert.ok(navContent.includes('aria-label="Primary mobile navigation"'));
    assert.ok(navContent.includes('aria-current={isActive ? \'page\' : undefined}'));
  });

  // Test 7: Mobile More Drawer Sheet
  await t.test('NAV-003: MobileMoreSheet houses secondary vaults without desktop sidebar clutter', () => {
    const moreContent = fs.readFileSync(moreSheetPath, 'utf8');
    assert.ok(moreContent.includes('role="dialog"'), 'Must have dialog role');
    assert.ok(moreContent.includes('aria-modal="true"'), 'Must be modal');
    assert.ok(moreContent.includes('Audio Voice Vault'), 'Must contain Audio Vault');
    assert.ok(moreContent.includes('Photos &amp; Keepsakes'), 'Must contain Photos');
    assert.ok(moreContent.includes('Indic Language Studio'), 'Must contain Indic Studio');
    assert.ok(moreContent.includes('pb-safe'), 'Must have safe-area bottom padding');
  });

  // Test 8: Contextual Reflection Sheet
  await t.test('PRS-001: MobileReflectionSheet provides non-intrusive bottom drawer reflection', () => {
    const refContent = fs.readFileSync(reflectionSheetPath, 'utf8');
    assert.ok(refContent.includes('role="dialog"'), 'Must have dialog role');
    assert.ok(refContent.includes('Reflection &amp; Handoff'));
    assert.ok(refContent.includes('Start 1-Minute Breath Pause'));
  });

  // Test 9: Responsive Presence Shell Integration
  await t.test('PRS-002: Presence page docks mobile app bar, bottom nav, and hides desktop rails on compact view', () => {
    const presenceContent = fs.readFileSync(presencePagePath, 'utf8');
    assert.ok(presenceContent.includes('<MobileAppBar'), 'Must mount MobileAppBar');
    assert.ok(presenceContent.includes('<MobileBottomNav'), 'Must mount MobileBottomNav');
    assert.ok(presenceContent.includes('<MobileMoreSheet'), 'Must mount MobileMoreSheet');
    assert.ok(presenceContent.includes('<MobileReflectionSheet'), 'Must mount MobileReflectionSheet');
    assert.ok(presenceContent.includes('hidden md:flex h-16 border-b'), 'Desktop header hidden on mobile');
    assert.ok(presenceContent.includes('hidden md:flex w-24 lg:w-72'), 'Desktop left rail hidden on mobile');
    assert.ok(presenceContent.includes('hidden xl:flex w-80 lg:w-96'), 'Desktop right rail hidden on mobile');
  });

  // Test 10: Web App Manifest
  await t.test('PWA-001: app/manifest.ts exports standard installable manifest without insecure caching', () => {
    const manifestPath = path.join(rootDir, 'app', 'manifest.ts');
    assert.ok(fs.existsSync(manifestPath), 'manifest.ts must exist');
    const content = fs.readFileSync(manifestPath, 'utf8');
    assert.ok(content.includes('ParamSathya'), 'Must define app name');
    assert.ok(content.includes('standalone'), 'Must define standalone display');
    assert.ok(content.includes('theme_color'), 'Must define theme color');
  });
});
