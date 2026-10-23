/* =========================================================
   مذكرة شاملة — Introduction to Server-Side Development with PHP
   script.js — التفاعلات:
     1. تبديل الوضع (فاتح / داكن)
     2. طباعة / PDF
     3. زر العودة للأعلى
     4. تنقل الفهرس + Scroll Spy
     5. تصحيح الاختبار التفاعلي + عدّاد الدرجات
   ========================================================= */

(function () {
  'use strict';

  /* =========================================================
     1. تبديل الوضع الفاتح / الداكن
     ========================================================= */

  const THEME_KEY = 'php-chapter02-theme';
  const body = document.body;
  const themeToggle = document.getElementById('themeToggle');

  function applyTheme(mode) {
    const isDark = mode === 'dark';
    body.classList.toggle('dark-mode', isDark);

    if (themeToggle) {
      const icon = themeToggle.querySelector('.icon');
      const label = themeToggle.querySelector('.label');
      if (icon) icon.textContent = isDark ? '☀️' : '🌙';
      if (label) label.textContent = isDark ? 'الوضع الفاتح' : 'الوضع الداكن';
      themeToggle.setAttribute(
        'aria-label',
        isDark ? 'التبديل إلى الوضع الفاتح' : 'التبديل إلى الوضع الداكن'
      );
    }
  }

  function initTheme() {
    let savedTheme = null;
    try { savedTheme = localStorage.getItem(THEME_KEY); } catch (e) {}

    if (savedTheme === 'dark' || savedTheme === 'light') {
      applyTheme(savedTheme);
      return;
    }

    const prefersDark =
      window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches;

    applyTheme(prefersDark ? 'dark' : 'light');
  }

  function toggleTheme() {
    const isDark = body.classList.contains('dark-mode');
    const newTheme = isDark ? 'light' : 'dark';
    applyTheme(newTheme);
    try { localStorage.setItem(THEME_KEY, newTheme); } catch (e) {}
  }

  if (themeToggle) {
    initTheme();
    themeToggle.addEventListener('click', toggleTheme);
  }

  /* =========================================================
     2. طباعة / PDF
     ========================================================= */

  const printBtn = document.getElementById('printBtn');
  if (printBtn) {
    printBtn.addEventListener('click', function () { window.print(); });
  }

  /* =========================================================
     3. العودة للأعلى
     ========================================================= */

  const backToTop = document.getElementById('backToTop');
  const SHOW_AFTER = 400;

  function handleBackToTopVisibility() {
    if (!backToTop) return;
    if (window.scrollY > SHOW_AFTER) {
      backToTop.classList.add('visible');
    } else {
      backToTop.classList.remove('visible');
    }
  }

  if (backToTop) {
    backToTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    let ticking = false;
    window.addEventListener('scroll', function () {
      if (!ticking) {
        window.requestAnimationFrame(function () {
          handleBackToTopVisibility();
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });

    handleBackToTopVisibility();
  }

  /* =========================================================
     4. تنقل الفهرس + Scroll Spy
     ========================================================= */

  const tocLinks = document.querySelectorAll('.toc-list a[href^="#"]');

  tocLinks.forEach(function (link) {
    link.addEventListener('click', function (event) {
      const targetId = link.getAttribute('href');
      if (!targetId || targetId === '#') return;

      const target = document.querySelector(targetId);
      if (!target) return;

      event.preventDefault();

      const headerOffset = 16;
      const elementPosition =
        target.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = elementPosition - headerOffset;

      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });

      if (history.replaceState) {
        history.replaceState(null, '', targetId);
      }
    });
  });

  const sections = document.querySelectorAll('main section[id]');
  const tocMap = new Map();
  tocLinks.forEach(function (link) {
    const id = link.getAttribute('href');
    if (id) tocMap.set(id, link);
  });

  if (sections.length && tocMap.size && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          const id = '#' + entry.target.id;
          const link = tocMap.get(id);
          if (!link) return;

          if (entry.isIntersecting) {
            tocLinks.forEach(function (l) {
              l.classList.remove('active');
              l.style.fontWeight = '';
            });
            link.classList.add('active');
            link.style.fontWeight = '700';
          }
        });
      },
      { rootMargin: '-30% 0px -60% 0px', threshold: 0 }
    );

    sections.forEach(function (section) { observer.observe(section); });
  }

  /* =========================================================
     5. الاختبار التفاعلي — تصحيح تلقائي + عدّاد درجات
     ========================================================= */

  const quizContainer = document.getElementById('quiz-container');
  const quizSubmitBtn = document.getElementById('quizSubmitBtn');
  const quizResetBtn = document.getElementById('quizResetBtn');
  const quizResult = document.getElementById('quizResult');

  if (quizContainer && quizSubmitBtn) {

    const questions = quizContainer.querySelectorAll('.quiz-question');
    const TOTAL = questions.length;

    /**
     * قراءة إجابة المستخدم لسؤال محدد.
     */
    function getUserAnswer(question) {
      const checked = question.querySelector('input[type="radio"]:checked');
      return checked ? checked.value : null;
    }

    /**
     * تصحيح سؤال واحد.
     */
    function gradeQuestion(question) {
      const correct = question.getAttribute('data-correct');
      const answer = getUserAnswer(question);
      const feedback = question.querySelector('.quiz-feedback');

      question.classList.remove('answered-correct', 'answered-wrong');
      if (feedback) {
        feedback.textContent = '';
      }

      if (answer === null) {
        if (feedback) {
          feedback.textContent = '⚠️ لم تُجب عن هذا السؤال.';
        }
        return false;
      }

      const isCorrect = answer === correct;
      question.classList.add(isCorrect ? 'answered-correct' : 'answered-wrong');

      if (feedback) {
        const correctMsg = feedback.getAttribute('data-correct-feedback') || '✅ إجابة صحيحة.';
        const wrongMsg = feedback.getAttribute('data-wrong-feedback') || '❌ إجابة خاطئة.';
        feedback.textContent = isCorrect ? correctMsg : wrongMsg;
      }

      return isCorrect;
    }

    /**
     * تصحيح الاختبار كاملًا وعرض النتيجة.
     */
    function gradeQuiz() {
      let score = 0;
      let unanswered = 0;

      questions.forEach(function (question) {
        const answer = getUserAnswer(question);
        if (answer === null) unanswered++;
        if (gradeQuestion(question)) score++;
      });

      const percent = Math.round((score / TOTAL) * 100);
      let label = '';
      let cls = '';

      if (percent >= 90) {
        label = '🎉 ممتاز!';
        cls = 'excellent';
      } else if (percent >= 70) {
        label = '👍 جيد جدًا!';
        cls = 'good';
      } else if (percent >= 50) {
        label = '📚 مقبول — تحتاج مراجعة.';
        cls = 'good';
      } else {
        label = '⚠️ يحتاج مذاكرة إضافية.';
        cls = 'poor';
      }

      quizResult.className = 'quiz-result visible ' + cls;
      quizResult.innerHTML =
        '<p class="result-label">' + label + '</p>' +
        '<p class="result-score">' + score + ' / ' + TOTAL + ' (' + percent + '%)</p>' +
        '<p class="result-detail">' +
          'أجبت بشكل صحيح عن <strong>' + score + '</strong> سؤالًا، ' +
          'بشكل خاطئ أو بدون إجابة عن <strong>' + (TOTAL - score) + '</strong> سؤالًا.' +
          (unanswered > 0 ? '<br>منها <strong>' + unanswered + '</strong> سؤالًا لم تُجب عنه.' : '') +
        '</p>';

      quizResult.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    /**
     * إعادة تعيين الاختبار.
     */
    function resetQuiz() {
      questions.forEach(function (question) {
        question.classList.remove('answered-correct', 'answered-wrong');
        const feedback = question.querySelector('.quiz-feedback');
        if (feedback) feedback.textContent = '';

        const inputs = question.querySelectorAll('input[type="radio"]');
        inputs.forEach(function (input) { input.checked = false; });
      });

      quizResult.className = 'quiz-result';
      quizResult.innerHTML = '';

      quizContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    quizSubmitBtn.addEventListener('click', gradeQuiz);
    if (quizResetBtn) {
      quizResetBtn.addEventListener('click', resetQuiz);
    }
  }
/* =========================================================
   شريط التنقل العلوي — إظهار/إخفاء على الهاتف
   ========================================================= */

(function initTopNav() {
  const toggle = document.getElementById('topNavToggle');
  const links = document.getElementById('topNavLinks');

  if (toggle && links) {
    toggle.addEventListener('click', function () {
      links.classList.toggle('open');
      const isOpen = links.classList.contains('open');
      toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    // إغلاق القائمة عند النقر على أي رابط (مفيد على الهاتف)
    links.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        links.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }
})();
})();