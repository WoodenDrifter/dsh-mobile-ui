/**
 * Client half of @local/dsh-mobile-ui.
 *
 * Adds a "界面布局" (Layout) preference row to General settings, backed by
 * localStorage (browser-local, so it works on the non-loopback Cloudflare
 * tunnel where Host settings persistence is disabled).
 *
 * When the mode is "mobile", a global <style> (gated on
 * <html data-dsh-layout="mobile">) reflows the settings panel — which is
 * owned by @deepseek-ai/dsh-client-ui-settings-general — from its desktop
 * "188px left nav | right content" layout into a stacked
 * "top horizontal-scroll category strip | full-width content" layout.
 *
 * Class names VOzbGW_* are the settings panel's CSS-module hashes for the
 * installed DSH build; they are stable until DSH is rebuilt. If a DSH update
 * changes the hash prefix, re-pin these selectors.
 */
window.__ModuleLoader__.load({
  id: '@local/dsh-mobile-ui',
  factory(require) {
    const React = require('react');
    const h = React.createElement;
    const useState = React.useState;
    const useEffect = React.useEffect;

    const STORAGE_KEY = 'dsh.settingsLayout.mode';
    const NS = 'dsh-mobile-ui';

    const FALLBACK = {
      en: { label: 'Layout', desktop: 'Desktop', mobile: 'Mobile' },
      zh: { label: '界面布局', desktop: '桌面', mobile: '移动' },
    };

    function readMode() {
      try {
        const v = localStorage.getItem(STORAGE_KEY);
        return v === 'mobile' ? 'mobile' : 'desktop';
      } catch (_) { return 'desktop'; }
    }
    function writeMode(m) {
      try { localStorage.setItem(STORAGE_KEY, m); } catch (_) {}
    }
    function applyModeAttr(m) {
      const el = document.documentElement;
      if (m === 'mobile') el.setAttribute('data-dsh-layout', 'mobile');
      else el.removeAttribute('data-dsh-layout');
    }

    // Segmented-control styles copied from
    // @deepseek-ai/dsh-client-ui-primitives SegmentedControl.module.css,
    // renamed under this plugin's prefix (dshslm_). Only theme tokens are
    // referenced, so tokens remain the only shared styling dependency.
    const CONTROL_CSS = [
      '.dshslm_row{color:var(--dsw-alias-label-primary);overflow-wrap:anywhere;padding:16px 0;font-size:14px;line-height:22px;display:flex;align-items:center;gap:12px}',
      '.dshslm_label{flex:0 0 auto}',
      '.dshslm_control{position:relative;display:inline-grid;grid-auto-flow:column;grid-auto-columns:1fr;gap:2px;padding:4px;border-radius:var(--dsw-radius-md);background:var(--dsw-alias-interactive-bg-hover)}',
      '.dshslm_indicator{position:absolute;top:4px;left:4px;width:calc((100% - 8px - 2px * (var(--dsh-segment-count) - 1)) / var(--dsh-segment-count));height:calc(100% - 8px);border:0;border-radius:var(--dsw-radius-sm);background:var(--dsw-alias-bg-layer-1);box-shadow:var(--dsw-elevation-soft);transform:translateX(calc(var(--dsh-segment-index) * (100% + 2px)));transition:transform 160ms ease;pointer-events:none}',
      '.dshslm_tab{box-sizing:border-box;position:relative;z-index:1;height:28px;padding:0 16px;border:0;border-radius:var(--dsw-radius-sm);background:transparent;color:var(--dsw-alias-label-secondary);font:inherit;font-size:13px;line-height:20px;font-weight:500;white-space:nowrap;cursor:pointer;transition:color 120ms ease}',
      '.dshslm_tab:hover:not(:disabled),.dshslm_tab[aria-selected="true"]{color:var(--dsw-alias-label-primary)}',
      '.dshslm_tab:focus-visible{outline:var(--dsw-focus-ring-width) solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline-offset:-2px}',
      '@media (prefers-reduced-motion:reduce){.dshslm_indicator,.dshslm_tab{transition:none}}',
    ].join('\n');

    // Attribute-gated reflow rules; specificity (attr + class) outranks the
    // host's single-class rules, so order does not matter.
    const REFLOW_CSS = [
      '[data-dsh-layout="mobile"] .VOzbGW_panel{flex-direction:column;width:100vw;max-width:100vw;height:100vh;height:100dvh;max-height:100vh;max-height:100dvh;border-radius:0}',
      '[data-dsh-layout="mobile"] .VOzbGW_nav{width:auto;flex:none;gap:8px;padding:10px 8px 0}',
      '[data-dsh-layout="mobile"] .VOzbGW_navTitle{display:none}',
      '[data-dsh-layout="mobile"] .VOzbGW_navList{flex-direction:row;overflow-x:auto;overflow-y:hidden;flex:0 0 auto;gap:8px;padding-bottom:8px;-webkit-overflow-scrolling:touch}',
      '[data-dsh-layout="mobile"] .VOzbGW_navCell{flex:0 0 auto}',
      '[data-dsh-layout="mobile"] .VOzbGW_navLabel{flex:0 0 auto;overflow:visible;text-overflow:clip}',
      '[data-dsh-layout="mobile"] .VOzbGW_content{flex:1 1 0;min-height:0}',
      '[data-dsh-layout="mobile"] .VOzbGW_options{padding:0 16px 24px}',
      '[data-dsh-layout="mobile"] .VOzbGW_header{padding:16px 14px 8px 10px}',
    ].join('\n');

    return {
      inject: ['slots'],
      apply(ctx) {
        // Locale for the row's visible strings; fall back if locale is absent.
        let t = (k) => k;
        let disposeLocale = null;
        try {
          if (ctx.locale && ctx.locale.register && ctx.locale.bind) {
            disposeLocale = ctx.locale.register(NS, {
              en: { label: 'Layout', desktop: 'Desktop', mobile: 'Mobile' },
              zh: { label: '界面布局', desktop: '桌面', mobile: '移动' },
            });
            t = ctx.locale.bind(NS);
          }
        } catch (_) { /* keep fallback */ }
        const tt = (k) => (t ? t(k) : (FALLBACK[ ((ctx.locale && ctx.locale.getLocale && ctx.locale.getLocale().id) || 'en').split('-')[0] ] || FALLBACK.en)[k] || k);

        function LayoutModeRow() {
          const [mode, setMode] = useState(readMode);
          useEffect(() => { applyModeAttr(mode); }, [mode]);
          function choose(next) {
            if (next === mode) return;
            setMode(next);
            writeMode(next);
            applyModeAttr(next);
          }
          function onKeyDown(e) {
            if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); choose('mobile'); }
            else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); choose('desktop'); }
          }
          const idx = mode === 'mobile' ? 1 : 0;
          const tab = (value) => h('button', {
            key: value,
            type: 'button',
            role: 'tab',
            'aria-selected': mode === value ? 'true' : 'false',
            tabIndex: mode === value ? 0 : -1,
            className: 'dshslm_tab',
            onClick: () => choose(value),
          }, tt(value));
          return h('div', { className: 'dshslm_row' },
            h('span', { className: 'dshslm_label' }, tt('label')),
            h('div', {
              className: 'dshslm_control',
              role: 'tablist',
              'aria-label': tt('label'),
              style: { '--dsh-segment-count': '2', '--dsh-segment-index': String(idx) },
              onKeyDown,
            },
              h('div', { className: 'dshslm_indicator', 'aria-hidden': 'true' }),
              tab('desktop'),
              tab('mobile'),
            ),
          );
        }

        // Global reflow stylesheet + initial mode attribute.
        const styleEl = document.createElement('style');
        styleEl.setAttribute('data-dsh-mobile-ui', '');
        styleEl.textContent = CONTROL_CSS + '\n' + REFLOW_CSS;
        document.head.appendChild(styleEl);
        applyModeAttr(readMode());

        // Preference row in General settings (self-disposed with the slot owner).
        ctx.slots.inject('settings.general.item', () => ctx.slots.register(
          { name: 'settings.general.item', id: 'dsh-layout-mode', order: 50, label: () => tt('label') },
          LayoutModeRow,
        ));

        // Clean up the global resources this plugin owns.
        ctx.effect(() => () => {
          styleEl.remove();
          document.documentElement.removeAttribute('data-dsh-layout');
          if (disposeLocale) { try { disposeLocale(); } catch (_) {} }
        });
      },
    };
  },
});
