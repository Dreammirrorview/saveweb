// eslint-disable-next-line no-undef,no-unused-vars
const app = new Vue({
  el: '#app',
  data: {
    popupType: null,
    popupTitle: window.popupSuccessTitle,
    isPopupActive: false,
    // integrationsData: window.integrationsData,
    isActiveRequest: false,
    // eslint-disable-next-line max-len
    // confirmLanguages: ['RU', 'EN', 'BG', 'CZ', 'DE', 'ES', 'GR', 'HU', 'ID', 'IT', 'PL', 'PT', 'RO', 'RS', 'SK', 'TH', 'TR', 'VN'],
    formOptions: {
      websiteLink: null,
      // isIntegration: false,
      // selectedIntegration: 'email',
      // intagrationData: {},
      isLandUnique: false,
      // isAllPageDownload: false,
      // confirmLanguage: 'RU',
      // isMobileVersion: false,
      isDefaultDownload: false,
      isSaveStructure: false,
    },
    downloadedFiles: 0,
    apiUrl: 'https://copier.saveweb2zip.com',
  },
  methods: {
    download(filename, url) {
      const element = document.createElement('a');
      element.setAttribute('href', url);
      element.setAttribute('download', filename);

      element.style.display = 'none';
      document.body.appendChild(element);

      element.click();

      document.body.removeChild(element);
    },
    checkProgress(hash) {
      const http = new XMLHttpRequest();
      const url = `${this.apiUrl}/api/getStatus/${hash}`;

      http.open('GET', url, true);
      http.setRequestHeader(
        'Content-type',
        'application/x-www-form-urlencoded',
      );

      http.onreadystatechange = () => {
        if (http.readyState === 4 && http.status === 200) {
          const response = JSON.parse(http.response);

          const numberAnimation = setInterval(() => {
            if (this.downloadedFiles < response.copiedFilesAmount) {
              this.downloadedFiles += 1;
            } else {
              clearInterval(numberAnimation);
            }
          }, 10);

          if (!response.isFinished) {
            setTimeout(() => {
              this.checkProgress(response.md5);
            }, 1500);
          } else if (response.isFinished && response.success) {
            this.download(
              'SaveWeb2ZIP.zip',
              `${this.apiUrl}/api/downloadArchive/${hash}`,
            );
            // eslint-disable-next-line no-undef
            gtag('event', 'download-webpage', {
              url: '',
            });
            this.popupTitle = window.popupSuccessTitle;
            this.popupType = 'downloadSuccess';
            this.isPopupActive = true;
            this.isActiveRequest = false;
            this.downloadedFiles = response.copiedFilesAmount;
          } else if (response.isFinished && !response.success) {
            this.popupTitle = `${window.popupDeclineTitle} ${window.errors[response.errorText] || ''}`;
            this.popupType = 'downloadDecline';
            this.isPopupActive = true;
            this.isActiveRequest = false;
            this.downloadedFiles = 0;
          }
        } else if (http.readyState === 4 && http.status !== 200) {
          const response = JSON.parse(http.response);
          this.popupTitle = `${window.popupDeclineTitle} ${window.errors[response.errorText] || ''}`;
          this.popupType = 'downloadDecline';
          this.isPopupActive = true;
          this.isActiveRequest = false;
          this.downloadedFiles = 0;
        }
      };

      http.send(null);
    },
    submitForm(evt) {
      evt.preventDefault();

      const http = new XMLHttpRequest();
      const url = `${this.apiUrl}/api/copySite`;

      http.open('POST', url, true);
      http.setRequestHeader(
        'Content-type',
        'application/json',
      );
      const body = JSON.stringify({
        url: this.formOptions.websiteLink,
        renameAssets: this.formOptions.isLandUnique,
        saveStructure: this.formOptions.isSaveStructure,
        alternativeAlgorithm: this.formOptions.isDefaultDownload,
      });
      http.onreadystatechange = () => {
        if (http.readyState === 4 && http.status === 200) {
          const response = JSON.parse(http.response);
          if (response.isFinished && !response.success) {
            this.popupTitle = `${window.popupDeclineTitle} ${window.errors[response.errorText] || ''}`;
            this.popupType = 'downloadDecline';
            this.isPopupActive = true;
            this.isActiveRequest = false;
          } else {
            this.checkProgress(response.md5);
          }
        } else if (http.readyState === 4 && http.status !== 200) {
          const response = JSON.parse(http.response);
          this.popupTitle = `${window.popupDeclineTitle} ${window.errors[response.errorText] || ''}`;
          this.popupType = 'downloadDecline';
          this.isPopupActive = true;
          this.isActiveRequest = false;
        }
      };
      http.send(body);
      this.downloadedFiles = 0;
      this.isActiveRequest = true;
    },
    // openFormPopup(evt) {
    //   evt.preventDefault();
    //
    //   this.popupType = 'form';
    //   this.popupTitle = window.popupFormTitle;
    //   this.isPopupActive = true;
    // },
    successFormPopup(evt) {
      evt.preventDefault();

      this.isPopupActive = false;
      // this.formOptions.isIntegration = true;
    },
    declineFormPopup(evt) {
      evt.preventDefault();

      this.isPopupActive = false;
      // this.formOptions.isIntegration = false;
    },
    closePopup(evt) {
      evt.preventDefault();
      this.isPopupActive = false;
      // eslint-disable-next-line no-self-assign
      // this.formOptions.isIntegration = this.formOptions.isIntegration;
    },
    isUrlValid(url) {
      return /^https?:\/\/.*/g.test(url);
    },
    isOnionDomain(url) {
      return /.onion$|.onion\//g.test(url);
    },
    onChangeUrl(evt) {
      if (!this.isUrlValid(this.formOptions.websiteLink)
          || this.formOptions.websiteLink.length === 0
          || this.isOnionDomain(this.formOptions.websiteLink)) {
        evt.target.setCustomValidity(window.incorrectLink);
      } else {
        evt.target.setCustomValidity('');
      }
    },
    onChangeLang(evt) {
      window.location.href = `/${evt.target.value}`;
    },
  },
});
