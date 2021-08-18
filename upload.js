const bytesToSize = (bytes) => {
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  if (!bytes) {
    return '0 B';
  }
  const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
  return Math.round(bytes / Math.pow(1024, i)) + ' ' + sizes[i];
};

const element = (tag, classes = [], content) => {
  const node = document.createElement(tag);

  if (classes.length) {
    node.classList.add(...classes);
  }

  if (content) {
    node.textContent = content;
  }

  return node;
};

export const upload = (selector, options = {}) => {
  let files = [];
  const onUpload = options.onUpload ?? noop;
  const dropArea = document.querySelector(selector);
  const input = document.querySelector('#file-input');
  const preview = element('div', ['preview']);
  const upload = element('button', ['btn', 'primary'], 'Upload on server');
  upload.style.display = 'none';
  preview.style.display = 'none';

  if (options.multi) {
    dropArea.setAttribute('multiple', true);
    input.setAttribute('multiple', true);
  }

  if (options.accept && Array.isArray(options.accept)) {
    dropArea.setAttribute('accept', options.accept.join(','));
    input.setAttribute('accept', options.accept.join(','));
  }

  dropArea.insertAdjacentElement('afterend', preview);
  dropArea.insertAdjacentElement('afterend', upload);

  const filesHendler = (userFiles) => {
    files = [...files, ...Array.from(userFiles)];
    preview.innerHTML = '';
    upload.style.display = 'flex';
    preview.style.display = 'grid';

    files.forEach((file) => {
      if (!file.type.match('image')) {
        return;
      }

      const reader = new FileReader();

      reader.onload = (ev) => {
        const src = ev.target.result;
        preview.insertAdjacentHTML(
          'afterbegin',
          `
              <div class="preview-image">
                <div class="preview-remove" data-name="${
                  file.name
                }">&times;</div>
                <img src="${src}" alt="${file.name}" />
                <div class="preview-info">
                  <span>${file.name}</span>
                  ${bytesToSize(file.size)}
                </div>
              </div>
            `
        );
      };

      reader.readAsDataURL(file);
    });
  };

  const handleDrop = (e) => {
    if (!e.dataTransfer.files.length) {
      return;
    }
    return filesHendler(e.dataTransfer.files);
  };

  const changeHandler = (e) => {
    if (!e.target.files.length) {
      return;
    }
    return filesHendler(e.target.files);
  };

  const removeHandler = (e) => {
    if (!e.target.dataset.name) {
      return;
    }

    const { name } = e.target.dataset;

    files = files.filter((file) => file.name !== name);

    if (!files.length) {
      upload.style.display = 'none';
      preview.style.display = 'none';
    }

    const block = preview
      .querySelector(`[data-name="${name}"]`)
      .closest('.preview-image');

    block.classList.add('removing');
    setTimeout(() => block.remove(), 300);
  };

  const clearPreview = (el) => {
    el.style.bottom = '4px';
    el.style.opacity = '1';
    el.innerHTML = `<div class="preview-info-progress"></div>`;
  };

  const uploadHandler = () => {
    preview.querySelectorAll('.preview-remove').forEach((e) => e.remove());
    const previewInfo = preview.querySelectorAll('.preview-info');
    previewInfo.forEach(clearPreview);
    onUpload(files, previewInfo);
  };

  const preventDefaults = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  dropArea.addEventListener('drop', handleDrop);
  input.addEventListener('change', changeHandler);
  preview.addEventListener('click', removeHandler);
  upload.addEventListener('click', uploadHandler);

  ['dragenter', 'dragover', 'dragleave', 'drop'].forEach((eventName) => {
    dropArea.addEventListener(eventName, preventDefaults);
    document.body.addEventListener(eventName, preventDefaults);
  });

  ['dragenter', 'dragover'].forEach((eventName) => {
    dropArea.addEventListener(eventName, () => {
      dropArea.classList.add('active');
    });
  });

  ['dragleave', 'drop'].forEach((eventName) => {
    dropArea.addEventListener(eventName, () => {
      dropArea.classList.remove('active');
    });
  });
};
