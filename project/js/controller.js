const controller = {
    initGoogleDrive() {
        gapi.load('client:picker', {
            callback: () => {
                gapi.client.load('drive', 'v3');
            }
        });
    },

    loadFromGoogleDrive() {
        const apiKey = 'AIzaSyCvbg3sFQOkFp915iAGVGgliKII7vtnWMM';
        const clientId = '198715010136-id0i60vvr2h4o04at01igs7smf99k2pf.apps.googleusercontent.com';
        const scope = 'https://www.googleapis.com/auth/drive.readonly';

        gapi.client.init({
            apiKey: apiKey,
            clientId: clientId,
            scope: scope
        }).then(() => {
            return gapi.auth2.getAuthInstance().signIn();
        }).then(() => {
            const picker = new google.picker.PickerBuilder()
                .addView(google.picker.ViewId.DOCS)
                .setOAuthToken(gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse().access_token)
                .setDeveloperKey(apiKey)
                .setCallback(data => {
                    if (data.action === google.picker.Action.PICKED) {
                        const fileId = data.docs[0].id;
                        gapi.client.drive.files.get({
                            fileId: fileId,
                            alt: 'media'
                        }).then(response => {
                            this.processData(response.body);
                        }).catch(err => view.showError('Помилка завантаження з Google Drive: ' + err.message));
                    }
                })
                .build();
            picker.setVisible(true);
        }).catch(err => view.showError('Помилка авторизації Google Drive: ' + err.message));
    },

    loadFromGitHub() {
        const url = document.getElementById('githubUrl').value;
        if (!url) {
            view.showError('Введіть URL файлу GitHub');
            return;
        }
        fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'text/plain'
            }
        })
            .then(response => {
                if (!response.ok) {
                    if (response.status === 404) {
                        throw new Error('Файл не знайдено. Перевірте URL або доступ до репозиторію.');
                    } else if (response.status === 403) {
                        throw new Error('Доступ заборонено. Репозиторій може бути приватним або є проблеми з CORS.');
                    } else {
                        throw new Error(`Помилка HTTP: ${response.status} ${response.statusText}`);
                    }
                }
                return response.text();
            })
            .then(data => this.processData(data))
            .catch(err => view.showError(`Помилка завантаження з GitHub: ${err.message}`));
    },

    generateSampleData() {
        const sampleData = [
            "Name,Score1,Score2,Score3,Score4,Score5,Score6",
            "Богдан Байстрюк,60,60,60,60,60,60",
            "Олена Коваль,75,80,70,85,90,78",
            "Іван Петренко,90,85,88,92,87,90",
            "Марія Сидоренко,65,70,60,75,80,68",
            "Андрій Шевченко,85,90,88,87,92,90"
        ].join('\n');
        this.processData(sampleData);
    },

    processData(content) {
        try {
            const data = model.parseCSV(content);
            if (data.length === 0) {
                view.showError('Немає валідних даних у файлі');
                return;
            }
            const result = model.performRegression(data);
            view.renderResults(result);
        } catch (err) {
            view.showError('Помилка обробки даних: ' + err.message);
        }
    }
};

// Зробити controller глобально доступним
window.controller = controller;