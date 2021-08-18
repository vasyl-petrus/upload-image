import firebase from 'firebase/app';
import 'firebase/storage';
import { upload } from './upload.js';

const firebaseConfig = {
  apiKey: process.env.API_KEY,
  authDomain: process.env.AUTH_DOMAIN,
  projectId: process.env.PRIJECT_ID,
  storageBucket: process.env.STORAGE_BUCKET,
  messagingSenderId: process.env.MESSAGING_SENDER_ID,
  appId: process.env.apAPP_IDpId,
};

firebase.initializeApp(firebaseConfig);

const storage = firebase.storage();

upload('#drop-area', {
  multi: true,
  accept: ['.png', '.jpg', '.jpeg', '.gif'],
  onUpload(files, blocks) {
    files.forEach((file, index) => {
      const ref = storage.ref(`images/${file.name}`);
      const task = ref.put(file);

      task.on(
        'state_changed',
        (snapshot) => {
          const percentage =
            ((snapshot.bytesTransferred / snapshot.totalBytes) * 100).toFixed(
              0
            ) + '%';
          const block = blocks[index].querySelector('.preview-info-progress');
          block.textContent = percentage;
          block.style.width = percentage;
          if (percentage === '100%') {
            block.innerHTML = '<span class="image-url"></span>';
          }
        },
        (error) => {
          console.log(error);
        },
        () => {
          task.snapshot.ref.getDownloadURL().then((url) => {
            const copyImageLink = blocks[index]
              .querySelector('.preview-info-progress')
              .querySelector('.image-url');

            copyImageLink.textContent = 'Copy link';
            copyImageLink.dataset['link'] = url;

            copyImageLink.addEventListener('click', (e) => {
              const input = document.createElement('textarea');
              input.value = e.target.dataset.link;
              document.body.appendChild(input);
              input.select();
              document.execCommand('copy');
              document.body.removeChild(input);

              e.target.textContent = 'Copied!';
              setTimeout(() => (e.target.textContent = 'Copy link'), 1000);
            });
          });
        }
      );
    });
  },
});
