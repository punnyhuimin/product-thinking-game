/*
 * Reusable lesson components. No dependencies; works from file://.
 *
 * Sorter: classify each statement into one of a fixed set of buckets,
 * with instant feedback and an explanation.
 *   Sorter.mount('#id', { buckets: ['A', 'B'], items: [{ text, answer, why }] })
 *
 * Recall: write from memory, then reveal the answer and self-check.
 *   Recall.mount('#id', { prompt, answerHtml, checks: ['...'] })
 */
(function () {
  function el(tag, attrs, children) {
    const node = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs || {})) {
      if (k === 'class') node.className = v;
      else if (k === 'html') node.innerHTML = v;
      else node.setAttribute(k, v);
    }
    (children || []).forEach((c) => node.append(c));
    return node;
  }

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  const Sorter = {
    mount(selector, { buckets, items }) {
      const root = document.querySelector(selector);
      let answered = 0;
      let correct = 0;
      const score = el('p', { class: 'score' });
      const updateScore = () => {
        score.textContent = answered === items.length
          ? `Score: ${correct} / ${items.length}. ${correct === items.length ? 'Clean sweep.' : 'Reload the page to try a fresh order.'}`
          : `${answered} of ${items.length} answered`;
      };

      shuffle(items).forEach((item) => {
        const feedback = el('p', { class: 'feedback' });
        const buttons = buckets.map((b) => el('button', { class: 'choice', type: 'button' }, [b]));
        buttons.forEach((btn, i) => {
          btn.addEventListener('click', () => {
            const ok = buckets[i] === item.answer;
            answered++;
            if (ok) correct++;
            buttons.forEach((b, j) => {
              b.disabled = true;
              if (buckets[j] === item.answer) b.classList.add('correct');
              else if (j === i) b.classList.add('wrong');
            });
            feedback.innerHTML =
              `<span class="verdict ${ok ? 'ok' : 'no'}">${ok ? 'Yes.' : 'Not quite.'}</span>${item.why}`;
            updateScore();
          });
        });
        root.append(
          el('div', { class: 'sorter-item' }, [
            el('p', { class: 'prompt', html: item.text }),
            el('div', { class: 'choices' }, buttons),
            feedback,
          ])
        );
      });
      root.append(score);
      updateScore();
    },
  };

  const Recall = {
    mount(selector, { prompt, answerHtml, checks, placeholder }) {
      const root = document.querySelector(selector);
      const box = el('textarea', { class: 'recall', placeholder: placeholder || 'Type from memory. No peeking.' });
      const revealBtn = el('button', { class: 'btn', type: 'button' }, ['Reveal answer']);
      const reveal = el('div', { class: 'reveal', html: answerHtml });
      reveal.hidden = true;
      if (checks && checks.length) {
        const list = el('div', { class: 'checklist' }, [el('p', { html: '<strong>Check your answer:</strong>' })]);
        checks.forEach((c) => list.append(el('label', {}, [el('input', { type: 'checkbox' }), c])));
        reveal.append(list);
      }
      revealBtn.addEventListener('click', () => {
        reveal.hidden = false;
        revealBtn.disabled = true;
      });
      if (prompt) root.append(el('p', { html: prompt }));
      root.append(box, el('div', { class: 'btn-row' }, [revealBtn]), reveal);
    },
  };

  window.Sorter = Sorter;
  window.Recall = Recall;
})();
