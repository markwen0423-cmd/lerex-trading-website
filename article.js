function getArticleId() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id') || 'story-about-lerex';
}

function renderArticle(articleId, lang) {
  const article = articleContent[articleId];
  
  if (!article || !article[lang]) {
    console.error('Article not found');
    return;
  }
  
  const content = article[lang];
  
  document.getElementById('article-category').textContent = content.category;
  document.getElementById('article-date').textContent = content.date;
  document.getElementById('article-read-time').textContent = content.readTime;
  document.getElementById('article-title').textContent = content.title;
  document.getElementById('article-intro').textContent = content.intro;
  
  const bodyContainer = document.getElementById('article-body');
  bodyContainer.innerHTML = '';
  
  content.sections.forEach(section => {
    const sectionDiv = document.createElement('div');
    sectionDiv.className = 'article-section';
    
    const heading = document.createElement('h2');
    heading.textContent = section.heading;
    sectionDiv.appendChild(heading);
    
    const paragraph = document.createElement('p');
    paragraph.textContent = section.content;
    sectionDiv.appendChild(paragraph);
    
    if (section.list) {
      const ul = document.createElement('ul');
      ul.className = 'article-list';
      section.list.forEach(item => {
        const li = document.createElement('li');
        li.textContent = item;
        ul.appendChild(li);
      });
      sectionDiv.appendChild(ul);
    }
    
    bodyContainer.appendChild(sectionDiv);
  });
  
  document.getElementById('article-conclusion-text').textContent = content.conclusion;
  document.getElementById('article-cta-text').textContent = content.cta;
  document.title = content.title + ' - LEREX';
}

document.addEventListener('DOMContentLoaded', () => {
  const articleId = getArticleId();
  const currentLang = localStorage.getItem('selectedLanguage') || 'en';
  
  renderArticle(articleId, currentLang);
  
  const langSelect = document.getElementById('language-select');
  if (langSelect) {
    langSelect.value = currentLang;
    langSelect.addEventListener('change', (e) => {
      const newLang = e.target.value;
      localStorage.setItem('selectedLanguage', newLang);
      renderArticle(articleId, newLang);
      applyLanguage(newLang);
    });
  }
});
