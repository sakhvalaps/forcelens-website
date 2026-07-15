/**
 * @fileoverview ForceLens Landing Website — Script System
 * Provides interactive features including workspace simulators, guided integrations,
 * log stream generators, and chrome extension popup dialog controls.
 *
 * @author ForceLens Team
 * @license All Rights Reserved
 */

document.addEventListener('DOMContentLoaded', () => {

  /**
   * Initializes the Workspace Tab Switcher.
   * Synchronizes tab clicks with preview mockup images and URL address texts.
   */
  const sidebarItems = document.querySelectorAll('.sim-tab');
  const simContentTitle = document.getElementById('sim-workspace-tab-title');

  const panelTitles = {
    overview: 'chrome-extension://forcelens/workspace/overview',
    'log-explorer': 'chrome-extension://forcelens/workspace/log-explorer',
    'execution-tree': 'chrome-extension://forcelens/workspace/execution-tree',
    'order-of-execution': 'chrome-extension://forcelens/workspace/order-of-execution',
    'apex-debug': 'chrome-extension://forcelens/workspace/apex-debug',
    'ai-pulse': 'chrome-extension://forcelens/workspace/ai-pulse',
    errors: 'chrome-extension://forcelens/workspace/errors',
    timeline: 'chrome-extension://forcelens/workspace/timeline',
    dml: 'chrome-extension://forcelens/workspace/dml',
    soql: 'chrome-extension://forcelens/workspace/soql',
    performance: 'chrome-extension://forcelens/workspace/performance',
    limits: 'chrome-extension://forcelens/workspace/limits',
    byok: 'chrome-extension://forcelens/settings/byok',
    settings: 'chrome-extension://forcelens/settings/workspace'
  };

  const panelImages = {
    overview: './assets/forcelens_tab_overview.webp?v=hd',
    'log-explorer': './assets/forcelens_tab_log_explorer.webp?v=hd',
    'execution-tree': './assets/forcelens_tab_execution_tree.webp?v=hd',
    'order-of-execution': './assets/forcelens_tab_order_of_execution.webp?v=hd',
    'apex-debug': './assets/forcelens_tab_apex_debug.webp?v=hd',
    'ai-pulse': './assets/forcelens_tab_ai_pulse.webp?v=hd',
    errors: './assets/forcelens_tab_errors.webp?v=hd',
    timeline: './assets/forcelens_tab_timeline.webp?v=hd',
    dml: './assets/forcelens_tab_dml.webp?v=hd',
    soql: './assets/forcelens_tab_soql.webp?v=hd',
    performance: './assets/forcelens_tab_performance.webp?v=hd',
    limits: './assets/forcelens_tab_limits.webp?v=hd',
    byok: './assets/forcelens_byok.webp?v=hd',
    settings: './assets/forcelens_settings.webp?v=hd'
  };

  sidebarItems.forEach(item => {
    item.addEventListener('click', () => {
      const targetView = item.getAttribute('data-view');
      if (!panelImages[targetView]) return;

      sidebarItems.forEach(i => i.classList.remove('active'));
      item.classList.add('active');

      if (simContentTitle && panelTitles[targetView]) {
        simContentTitle.textContent = panelTitles[targetView];
      }

      const viewportImg = document.getElementById('workspace-viewport-img');
      if (viewportImg) {
        viewportImg.src = panelImages[targetView];
        viewportImg.classList.remove('sim-fade-in');
        void viewportImg.offsetWidth;
        viewportImg.classList.add('sim-fade-in');
      }
    });
  });

  /**
   * Initializes the Integration Guided Tour.
   * Steps through active screenshots and mock URLs as users read the integration steps.
   */
  const tourSteps = document.querySelectorAll('.tour-step');
  const tourScreenImg = document.getElementById('tour-screen-body-target');
  const tourAddress = document.getElementById('tour-browser-address');

  const tourAddresses = {
    grid: 'https://orgfarm.lightning.force.com/lightning/setup/ApexDebugLogs',
    detail: 'https://orgfarm.lightning.force.com/lightning/setup/ApexDebugLogs/07Lgk000000N019',
    console: 'https://orgfarm-79dc04f179-dev-ed.develop.my.salesforce.com/_ui/common/apex/debug/ApexCSIPage'
  };

  const tourImages = {
    grid: './assets/forcelens_integration_logs_grid.webp?v=hd',
    detail: './assets/forcelens_integration_log_detail.webp?v=hd',
    console: './assets/forcelens_integration_dev_console.webp?v=hd'
  };

  tourSteps.forEach(step => {
    step.addEventListener('click', () => {
      const targetStep = step.getAttribute('data-step');
      if (!tourImages[targetStep]) return;

      tourSteps.forEach(s => s.classList.remove('active'));
      step.classList.add('active');

      if (tourScreenImg && tourAddress) {
        tourScreenImg.src = tourImages[targetStep];
        tourAddress.textContent = tourAddresses[targetStep];

        const parent = tourScreenImg.parentElement;
        if (parent) {
          parent.style.opacity = '0';
          setTimeout(() => {
            parent.style.transition = 'opacity 0.2s ease';
            parent.style.opacity = '1';
          }, 30);
        }
      }
    });
  });

  /**
   * Initializes the Flow Analyzer Interactive Stepper.
   * Animates screenshot previews corresponding to the flow analysis stages.
   */
  const stepperSteps = document.querySelectorAll('.stepper-step');
  const flowImg = document.getElementById('flow-stepper-img');
  const flowAddress = document.getElementById('flow-browser-address');

  const flowImages = {
    '1': './assets/forcelens_flow_integration_canvas.webp?v=hd',
    '2': './assets/forcelens_flow_progress.webp?v=hd',
    '3': './assets/forcelens_flow_personas.webp?v=hd',
    '4': './assets/forcelens_flow_result.webp?v=hd'
  };

  const flowAddresses = {
    '1': 'https://orgfarm.lightning.force.com/lightning/setup/Flows/AddCaseComment',
    '2': 'https://orgfarm.lightning.force.com/lightning/setup/Flows/Analyzing...',
    '3': 'https://orgfarm.lightning.force.com/lightning/setup/Flows/SelectLens',
    '4': 'https://orgfarm.lightning.force.com/lightning/setup/Flows/ReportReady'
  };

  stepperSteps.forEach(step => {
    step.addEventListener('click', () => {
      const targetStep = step.getAttribute('data-step');
      if (!flowImages[targetStep]) return;

      stepperSteps.forEach(s => s.classList.remove('active'));
      step.classList.add('active');

      if (flowImg && flowAddress) {
        flowImg.src = flowImages[targetStep];
        flowAddress.textContent = flowAddresses[targetStep];

        const parent = flowImg.parentElement;
        if (parent) {
          parent.style.opacity = '0';
          setTimeout(() => {
            parent.style.transition = 'opacity 0.2s ease';
            parent.style.opacity = '1';
          }, 30);
        }
      }
    });
  });

  /**
   * Controls the Smart Capture Sandbox logs streaming demonstration.
   * Automatically streams logs, clears overlay, and opens the mock extension popup window.
   */
  const btnTrigger = document.getElementById('btn-trigger-sandbox');
  const sandboxBody = document.getElementById('sandbox-logs-body-target');
  const liveIndicator = document.getElementById('sandbox-live-indicator');

  let captureInterval = null;
  let activeOverlay = null;

  const mockLogsList = [
    { op: 'OpportunityTriggerHandler', type: 'Trigger', size: '12.8K', status: 'Success' },
    { op: 'AutoCloseExpiredOppsFlow', type: 'Flow', size: '8.4K', status: 'Success' },
    { op: 'LeadConversionBatch', type: 'Apex', size: '34.2K', status: 'Error', err: 'System.DmlException: Insert failed' },
    { op: 'RESTOpportunityAPI', type: 'API', size: '15.1K', status: 'Success' }
  ];

  /**
   * Starts mock capture and pushes structured log objects into the screen.
   */
  function startSmartCaptureSandbox() {
    if (captureInterval) return;

    liveIndicator.classList.add('live');

    activeOverlay = document.createElement('div');
    activeOverlay.className = 'sandbox-sp-root';
    activeOverlay.innerHTML = `
      <div class="sandbox-sp-pill">
        <div class="sandbox-sp-dot"></div>
        <span class="sandbox-sp-label">Capturing logs... 0 caught</span>
        <button class="sandbox-sp-btn-cancel" id="sandbox-sp-cancel">Cancel</button>
      </div>
      <div class="sandbox-sp-panel open">
        <div class="sandbox-sp-panel-header">
          <span>Smart Capture Stream</span>
        </div>
        <div class="sandbox-sp-log-list" id="sandbox-sp-list-items">
          <div style="padding:16px; text-align:center; color:#94A3B8; font-size:11px;">Awaiting logs...</div>
        </div>
      </div>
    `;

    sandboxBody.parentElement.appendChild(activeOverlay);
    document.getElementById('sandbox-sp-cancel').addEventListener('click', stopSmartCaptureSandbox);

    let logIndex = 0;
    const listItems = document.getElementById('sandbox-sp-list-items');
    const labelSpan = activeOverlay.querySelector('.sandbox-sp-label');

    captureInterval = setInterval(() => {
      if (logIndex >= mockLogsList.length) {
        clearInterval(captureInterval);
        captureInterval = null;

        const dot = activeOverlay.querySelector('.sandbox-sp-dot');
        if (dot) {
          dot.className = 'sandbox-sp-dot done';
        }
        labelSpan.innerText = `Session complete — ${mockLogsList.length} logs caught`;

        const cancelBtn = document.getElementById('sandbox-sp-cancel');
        if (cancelBtn) {
          cancelBtn.innerText = 'Clear';
          cancelBtn.style.color = '#DC2626';
          cancelBtn.style.background = '#FEF2F2';
          cancelBtn.style.borderColor = '#FECACA';
        }

        setTimeout(() => {
          stopSmartCaptureSandbox();

          if (popupDropdown) {
            popupDropdown.style.display = 'flex';
            popupScreenMain.style.display = 'flex';
            popupScreenAdvanced.style.display = 'none';

            const hint = document.getElementById('fl-onboarding-hint');
            if (hint) hint.style.display = 'none';

            const btnAdvanced = document.getElementById('fl-popup-btn-advanced-trigger');
            if (btnAdvanced) {
              btnAdvanced.style.transition = 'all 0.3s ease';
              btnAdvanced.style.boxShadow = '0 0 0 4px rgba(99, 102, 241, 0.5)';
              btnAdvanced.style.borderColor = '#6366F1';
              btnAdvanced.style.background = '#EEF2FF';
            }

            setTimeout(() => {
              if (btnAdvanced) {
                btnAdvanced.style.boxShadow = '';
                btnAdvanced.style.borderColor = '';
                btnAdvanced.style.background = '';
              }

              popupScreenMain.style.display = 'none';
              popupScreenAdvanced.style.display = 'flex';

              const btnArm = document.getElementById('fl-popup-btn-arm');
              if (btnArm) {
                btnArm.style.transition = 'all 0.3s ease';
                btnArm.style.boxShadow = '0 0 0 4px rgba(99, 102, 241, 0.5)';
              }

              setTimeout(() => {
                if (btnArm) btnArm.style.boxShadow = '';
              }, 2000);

            }, 1500);
          }
        }, 1500);

        return;
      }

      if (logIndex === 0) listItems.innerHTML = '';

      const log = mockLogsList[logIndex];
      const isErr = log.status === 'Error';
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

      const row = document.createElement('div');
      row.className = `sandbox-sp-row ${isErr ? 'error' : 'success'}`;
      row.setAttribute('title', isErr ? `Error: ${log.err}` : 'Success');
      row.innerHTML = `
        <div class="sandbox-sp-row-dot"></div>
        <span class="sandbox-sp-row-op">${log.op}</span>
        ${isErr ? '<span style="font-size:9px; font-weight:800; color:#DC2626; background:#FEE2E2; padding:1px 4px; border-radius:3px; margin-right:4px;">ERROR</span>' : ''}
        <span class="sandbox-sp-row-meta">${timeStr} · ${log.size}</span>
      `;

      row.addEventListener('click', () => {
        alert(`Clicking on "${log.op}" opens the log in the ForceLens Full Workspace in a new tab!`);
      });

      listItems.appendChild(row);
      logIndex++;
      labelSpan.innerText = `Capturing logs... ${logIndex} caught`;

      listItems.scrollTop = listItems.scrollHeight;
    }, 1500);
  }

  /**
   * Stops sandbox trace captures and tears down mock UI stream wrappers.
   */
  function stopSmartCaptureSandbox() {
    if (captureInterval) {
      clearInterval(captureInterval);
      captureInterval = null;
    }

    if (activeOverlay) {
      activeOverlay.remove();
      activeOverlay = null;
    }

    liveIndicator.classList.remove('live');
  }

  btnTrigger.addEventListener('click', () => {
    if (captureInterval || activeOverlay) {
      stopSmartCaptureSandbox();
    } else {
      startSmartCaptureSandbox();
    }
  });

  document.querySelectorAll('a[href="#sandbox"]').forEach(link => {
    link.addEventListener('click', () => {
      setTimeout(() => {
        if (!captureInterval && !activeOverlay) startSmartCaptureSandbox();
      }, 650);
    });
  });

  /**
   * Controls the AI Provider options pill switcher in Spotlight A.
   */
  const byokPills = document.getElementById('byok-pills');
  const byokCaption = document.getElementById('byok-caption');
  const providerCaptions = {
    claude: 'Anthropic Claude — deep reasoning over long execution traces.',
    gpt: 'OpenAI GPT-4o / GPT-5 — fast, broad coverage for everyday debugging.',
    groq: 'Groq (Llama / Mixtral) — near-instant answers at the lowest cost.',
    openrouter: 'OpenRouter — one key, hundreds of models to route between.'
  };

  if (byokPills && byokCaption) {
    byokPills.addEventListener('click', (e) => {
      const pill = e.target.closest('.pill');
      if (!pill) return;

      byokPills.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');

      const caption = providerCaptions[pill.dataset.provider];
      if (caption) byokCaption.textContent = caption;
    });
  }

  /**
   * Controls the Flow Lenses tab switcher in Spotlight C.
   */
  const lensPills = document.getElementById('lens-pills');
  const lensCaption = document.getElementById('lens-caption');
  const lensAddress = document.getElementById('lens-address');
  const lensData = {
    developer: {
      caption: 'Developer lens — null-handling, bulkification, fault paths, and DML inside loops.',
      addr: 'chrome-extension://forcelens/flow/lens/developer'
    },
    business: {
      caption: 'Business Analyst lens — what the flow does in plain language, decisions, and outcomes.',
      addr: 'chrome-extension://forcelens/flow/lens/business'
    },
    qa: {
      caption: 'QA lens — every branch and path to test, plus edge cases that can break the flow.',
      addr: 'chrome-extension://forcelens/flow/lens/qa'
    },
    security: {
      caption: 'Security lens — running context, sharing, sensitive-field writes, and exposure risks.',
      addr: 'chrome-extension://forcelens/flow/lens/security'
    }
  };

  if (lensPills) {
    lensPills.addEventListener('click', (e) => {
      const pill = e.target.closest('.pill');
      if (!pill) return;

      const data = lensData[pill.dataset.lens];
      if (!data) return;

      lensPills.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');

      if (lensCaption) lensCaption.textContent = data.caption;
      if (lensAddress) lensAddress.textContent = data.addr;
    });
  }

  /**
   * Registers scroll-triggered element animations via IntersectionObserver.
   */
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    document.documentElement.classList.add('js-reveal-ready');
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    revealEls.forEach(el => revealObserver.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('is-visible'));
  }

  /**
   * Implements screenshot lightbox fullscreen zoom viewer handlers.
   */
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxClose = document.getElementById('lightbox-close');

  /**
   * Opens fullscreen screenshot lightbox window.
   * @param {string} src - Image URL target.
   * @param {string} alt - Alternative text.
   */
  function openLightbox(src, alt) {
    if (!lightbox || !lightboxImg || !src) return;

    lightboxImg.src = src;
    lightboxImg.alt = alt || 'ForceLens screenshot — full screen';
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  /**
   * Closes fullscreen screenshot lightbox window.
   */
  function closeLightbox() {
    if (!lightbox) return;

    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  document.addEventListener('click', (e) => {
    const img = e.target.closest('.sim-panel-image-view, .premium-browser-img');
    if (img) {
      openLightbox(img.currentSrc || img.src, img.alt);
    }
  });

  if (lightbox) lightbox.addEventListener('click', closeLightbox);
  if (lightboxClose) lightboxClose.addEventListener('click', (e) => { e.stopPropagation(); closeLightbox(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeLightbox(); });

  /**
   * Highlights matching navigation menu items during document scroll events.
   */
  const navLinks = Array.from(document.querySelectorAll('.nav-links a[href^="#"]'));
  const spySections = navLinks
    .map(link => document.getElementById(link.getAttribute('href').slice(1)))
    .filter(Boolean);

  if ('IntersectionObserver' in window && spySections.length) {
    const setActiveLink = (id) => {
      navLinks.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
      });
    };

    const spyObserver = new IntersectionObserver((entries) => {
      const visible = entries
        .filter(e => e.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
      if (visible.length) setActiveLink(visible[0].target.id);
    }, {
      rootMargin: '-72px 0px -55% 0px',
      threshold: 0
    });

    spySections.forEach(sec => spyObserver.observe(sec));
  }

  /**
   * Toggles accordion item rows on FAQ page widget.
   */
  const faqCards = document.querySelectorAll('.faq-accordion .perm-card');
  faqCards.forEach(card => {
    const header = card.querySelector('.perm-card-header');
    if (!header) return;

    header.addEventListener('click', () => {
      const isActive = card.classList.contains('active');
      faqCards.forEach(c => c.classList.remove('active'));
      if (!isActive) card.classList.add('active');
    });
  });

  /**
   * Slide-in mobile navigation: hamburger opens a right-side panel with a
   * dimmed overlay and a body scroll-lock. Closes on link click, overlay
   * click, Escape, or resizing back up to the desktop layout.
   */
  const navToggle = document.getElementById('nav-toggle');
  const navHeader = document.querySelector('.nav-header');
  const navOverlay = document.getElementById('nav-overlay');

  if (navToggle && navHeader) {
    const openMenu = () => {
      navHeader.classList.add('nav-mobile-open');
      document.body.classList.add('nav-open');
      navToggle.setAttribute('aria-expanded', 'true');
    };
    const closeMenu = () => {
      navHeader.classList.remove('nav-mobile-open');
      document.body.classList.remove('nav-open');
      navToggle.setAttribute('aria-expanded', 'false');
    };
    const toggleMenu = () => {
      navHeader.classList.contains('nav-mobile-open') ? closeMenu() : openMenu();
    };

    navToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleMenu();
    });

    navHeader.querySelectorAll('.nav-links a').forEach((link) => {
      link.addEventListener('click', closeMenu);
    });

    if (navOverlay) navOverlay.addEventListener('click', closeMenu);

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeMenu();
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 1024) closeMenu();
    });
  }

  /**
   * Adds a subtle shadow to the sticky header once the page is scrolled.
   */
  if (navHeader) {
    const onScroll = () => {
      navHeader.classList.toggle('is-scrolled', window.scrollY > 8);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /**
   * Manages state transitions and dropdown layouts on mock Extension Popup.
   */
  const popupDropdown = document.getElementById('fl-popup-dropdown');
  const popupScreenMain = document.getElementById('fl-popup-screen-main');
  const popupScreenAdvanced = document.getElementById('fl-popup-screen-advanced');

  const extensionIcon = document.getElementById('sf-extension-icon');
  const btnWorkspace = document.getElementById('fl-popup-btn-workspace');
  const btnCapture = document.getElementById('fl-popup-btn-capture');
  const btnAdvancedTrigger = document.getElementById('fl-popup-btn-advanced-trigger');
  const btnCancel = document.getElementById('fl-popup-btn-cancel');
  const btnArm = document.getElementById('fl-popup-btn-arm');

  const targetMeBtn = document.getElementById('fl-target-me');
  const targetOtherBtn = document.getElementById('fl-target-other');

  if (extensionIcon && popupDropdown) {
    extensionIcon.addEventListener('click', (e) => {
      e.stopPropagation();
      
      const hint = document.getElementById('fl-onboarding-hint');
      if (hint) {
        hint.style.display = 'none';
      }
      
      const isClosed = popupDropdown.style.display === 'none';
      if (isClosed) {
        popupDropdown.style.display = 'flex';
        popupScreenMain.style.display = 'flex';
        popupScreenAdvanced.style.display = 'none';
      } else {
        popupDropdown.style.display = 'none';
      }
    });

    document.addEventListener('click', (e) => {
      if (!popupDropdown.contains(e.target) && e.target !== extensionIcon && !extensionIcon.contains(e.target)) {
        popupDropdown.style.display = 'none';
      }
    });

    popupDropdown.addEventListener('click', (e) => {
      e.stopPropagation();
    });

    if (btnWorkspace) {
      btnWorkspace.addEventListener('click', () => {
        popupDropdown.style.display = 'none';
        const simSection = document.getElementById('simulator');
        if (simSection) {
          simSection.scrollIntoView({ behavior: 'smooth' });
        }
      });
    }

    if (btnCapture) {
      btnCapture.addEventListener('click', () => {
        popupDropdown.style.display = 'none';
        if (!captureInterval && !activeOverlay) {
          startSmartCaptureSandbox();
        }
      });
    }

    if (btnAdvancedTrigger) {
      btnAdvancedTrigger.addEventListener('click', () => {
        popupScreenMain.style.display = 'none';
        popupScreenAdvanced.style.display = 'flex';
      });
    }

    if (btnCancel) {
      btnCancel.addEventListener('click', () => {
        popupScreenAdvanced.style.display = 'none';
        popupScreenMain.style.display = 'flex';
      });
    }

    if (btnArm) {
      btnArm.addEventListener('click', () => {
        popupDropdown.style.display = 'none';
        if (!captureInterval && !activeOverlay) {
          startSmartCaptureSandbox();
        }
      });
    }

    if (targetMeBtn && targetOtherBtn) {
      targetMeBtn.addEventListener('click', () => {
        targetMeBtn.classList.add('active');
        targetOtherBtn.classList.remove('active');
      });
      targetOtherBtn.addEventListener('click', () => {
        targetOtherBtn.classList.add('active');
        targetMeBtn.classList.remove('active');
      });
    }
  }

});
