document.addEventListener('DOMContentLoaded', () => {
    const mainScreen = document.getElementById('main-screen');
    const aboutButton = document.querySelector('.about-button');
    const playerInfoContainer = document.getElementById('player-info-container');
    const playersNamesList = document.getElementById('players-names-list');
    const playerPhoto = document.getElementById('player-photo');
    const playerNickname = document.getElementById('player-nickname');
    const playerDescription = document.getElementById('player-description');
    const backButton = document.querySelector('.back-button');
    const playerDetailsDisplay = document.querySelector('.player-details-display');
    const teamSlogan = document.querySelector('.team-slogan');

    const mainThemeMusic = document.getElementById('main-theme-music');
    const aboutUsMusic = document.getElementById('about-us-music');
    const audioToggleButton = document.getElementById('audio-toggle-button');
    const bgVideo = document.getElementById('bg-video');
    const overlay = document.querySelector('.overlay');

    const toggleContentButton = document.getElementById('toggle-content-button');

    const MAX_VOLUME = 0.08;
    const FADE_DURATION = 1000;
    const FADE_INTERVAL = 50;

    // ИЗМЕНЕНО: Изначально предполагаем, что музыка не мьютится пользователем
    // Но будем реагировать на блокировку браузером.
    let isMusicMutedByUser = false; 
    let isContentVisible = true;
    

    const playersData = {
        'renami': {
            photo: 'images/renami_photo.jpg',
            nickname: 'renami-',
            description: 'sigmo core of 9yaica.'
        },
        'player2': { 
            photo: 'images/larl_photo.jpg',
            nickname: 'Larl',
            description: 'larl vinovat.'
        },
        'player3': { 
            photo: 'images/33_photo.jpg',
            nickname: '33',
            description: 'he was a student of TORONTOTOKYO'
        },
        'player4': { 
            photo: 'images/9class_photo.jpg',
            nickname: '9class',
            description: 'MOZG.'
        },
        'nolek': {
            photo: 'images/nolek_photo.jpg',
            nickname: 'nolek',
            description: 'sigmo supp of 9yaica.'
        }
    };
 
    function fadeOut(audioElement, callback) {
        if (audioElement.volume === 0) {
            audioElement.pause();
            if (callback) callback();
            return;
        }

        let volume = audioElement.volume;
        const fadeStep = volume / (FADE_DURATION / FADE_INTERVAL);

        const fadeAudio = setInterval(() => {
            if (volume > fadeStep) {
                volume -= fadeStep;
                audioElement.volume = volume;
            } else {
                audioElement.volume = 0;
                audioElement.pause();
                clearInterval(fadeAudio);
                if (callback) callback();
            }
        }, FADE_INTERVAL);
    }

    function fadeIn(audioElement, targetVolume, callback) {
        if (!isMusicMutedByUser) { // Если не мьютировано пользователем, тогда плавно включаем
            audioElement.volume = 0;
            audioElement.play().catch(e => console.error("Ошибка при воспроизведении аудио:", e)); 
            let volume = 0;
            const fadeStep = targetVolume / (FADE_DURATION / FADE_INTERVAL);

            const fadeAudio = setInterval(() => {
                if (volume < targetVolume - fadeStep) {
                    volume += fadeStep;
                    audioElement.volume = volume;
                } else {
                    audioElement.volume = targetVolume; 
                    clearInterval(fadeAudio);
                    if (callback) callback();
                }
            }, FADE_INTERVAL);
        } else { // Если мьютировано, просто запускаем без звука
            audioElement.volume = 0; // Гарантируем, что громкость 0
            audioElement.play().catch(e => console.error("Ошибка при воспроизведении аудио:", e));
            if (callback) callback();
        }
    }

    mainThemeMusic.volume = 0;
    bgVideo.volume = 0; // Видео всегда без звука, громкость 0
    bgVideo.play().catch(e => console.error("Ошибка при воспроизведении фонового видео:", e));

    // Инициализация кнопки звука при загрузке:
    // Если браузер заблокирует автовоспроизведение, то isMusicMutedByUser станет true,
    // и кнопка покажет "🔇", предлагая включить звук.
    // Если не заблокирует, то isMusicMutedByUser останется false, и кнопка покажет "🔊".
    audioToggleButton.innerHTML = '🔊'; // Изначально показываем, что звук включен
    audioToggleButton.classList.remove('hidden'); // Убираем класс hidden, чтобы кнопка была видна всегда

    mainThemeMusic.play()
        .then(() => {
            isMusicMutedByUser = false; // Музыка успешно запущена
            fadeIn(mainThemeMusic, MAX_VOLUME);
            audioToggleButton.innerHTML = '🔊'; // Показываем, что звук включен
            console.log("Музыка успешно запущена автоматически.");
        })
        .catch(error => {
            console.warn("Автовоспроизведение музыки заблокировано браузером. Пользователь должен будет включить вручную. Ошибка:", error);
            isMusicMutedByUser = true; // Музыка заблокирована, считаем, что она "мьютирована пользователем"
            audioToggleButton.innerHTML = '🔇'; // Показываем, что звук выключен
            
            mainThemeMusic.pause(); // Убедимся, что она на паузе
            mainThemeMusic.currentTime = 0;
        });

    audioToggleButton.addEventListener('click', () => {
        if (isMusicMutedByUser) {
            isMusicMutedByUser = false;
            audioToggleButton.innerHTML = '🔊';
            
            // Логика включения звука
            if (!isContentVisible) { 
                // Это когда контент скрыт и мы смотрим видео на полную яркость.
                // Музыка здесь не играет, а громкость bgVideo всегда 0.
                // Так что тут ничего не меняем для bgVideo.
            } else if (playerInfoContainer.classList.contains('fade-in') && !playerInfoContainer.classList.contains('hidden')) {
                // Если на экране ABOUT US
                fadeIn(aboutUsMusic, MAX_VOLUME);
                mainThemeMusic.pause();
                mainThemeMusic.currentTime = 0;
            } else { // Если на главном экране
                fadeIn(mainThemeMusic, MAX_VOLUME);
                aboutUsMusic.pause();
                aboutUsMusic.currentTime = 0;
            }

        } else { // Пользователь выключает звук
            isMusicMutedByUser = true;
            audioToggleButton.innerHTML = '🔇';
            fadeOut(mainThemeMusic); 
            fadeOut(aboutUsMusic); 
            // УБРАЛ fadeOut(bgVideo); -- это была причина остановки видео
        }
    });

    toggleContentButton.addEventListener('click', () => {
        if (isContentVisible) {
            mainScreen.classList.add('hide-content-box');
            playerInfoContainer.classList.add('hide-content-box');
            aboutButton.classList.add('hidden-for-video');
            teamSlogan.classList.add('hidden-for-video');
            overlay.classList.add('hidden-for-video');

            bgVideo.classList.remove('dim');
            bgVideo.classList.add('bright');
            toggleContentButton.innerHTML = '🖼️';

        } else {
            mainScreen.classList.remove('hide-content-box');
            playerInfoContainer.classList.remove('hide-content-box');
            aboutButton.classList.remove('hidden-for-video');
            teamSlogan.classList.remove('hidden-for-video');
            overlay.classList.remove('hidden-for-video');

            bgVideo.classList.remove('bright');
            bgVideo.classList.add('dim');
            toggleContentButton.innerHTML = '👁️';
        }
        isContentVisible = !isContentVisible;
    });

    function toggleScreens(showElement, hideElement, transitionToPlayersScreen) {
        if (!isContentVisible) {
            console.log("Контент скрыт для просмотра видео, переключение экранов невозможно.");
            return;
        }

        if (!isMusicMutedByUser) {
            if (transitionToPlayersScreen) {
                fadeOut(mainThemeMusic, () => {
                    fadeIn(aboutUsMusic, MAX_VOLUME);
                });
            } else {
                fadeOut(aboutUsMusic, () => {
                    fadeIn(mainThemeMusic, MAX_VOLUME);
                });
            }
        } else {
            // Если звук мьютирован пользователем, просто переключаем треки, не меняя громкость (которая 0)
            if (transitionToPlayersScreen) {
                 aboutUsMusic.volume = 0;
                 aboutUsMusic.play().catch(e => console.error("Ошибка при воспроизведении audio:", e));
                 mainThemeMusic.pause();
            } else {
                 mainThemeMusic.volume = 0;
                 mainThemeMusic.play().catch(e => console.error("Ошибка при воспроизведении audio:", e));
                 aboutUsMusic.pause();
            }
        }
        
        hideElement.classList.add('fade-out');
        hideElement.classList.remove('fade-in');
        
        if (transitionToPlayersScreen) {
            aboutButton.classList.add('fade-out');
            aboutButton.classList.remove('fade-in');
        } else {
            aboutButton.classList.remove('hidden'); 
            requestAnimationFrame(() => {
                aboutButton.classList.add('fade-in');
                aboutButton.classList.remove('fade-out');
            });
            document.querySelectorAll('#players-names-list li').forEach(li => {
                li.classList.remove('selected-player');
            });
        }
 
        Promise.race([
            new Promise(resolve => hideElement.addEventListener('transitionend', resolve, { once: true })),
            new Promise(resolve => setTimeout(resolve, 550))
        ]).then(() => {
            hideElement.classList.add('hidden');
            hideElement.style.opacity = '';

            if (transitionToPlayersScreen) {
                 aboutButton.classList.add('hidden');
            }
 
            showElement.classList.remove('fade-in');
            showElement.classList.add('hidden');
            showElement.style.opacity = '0';

            requestAnimationFrame(() => {
                showElement.classList.remove('hidden');
                showElement.classList.add('fade-in');
                showElement.classList.remove('fade-out');
                showElement.style.opacity = '';
            });

            if (showElement.id === 'player-info-container') {
                showElement.style.maxWidth = '900px';
            } else if (showElement.id === 'main-screen') {
                showElement.style.maxWidth = '500px';
            }
 
            if (showElement.id === 'player-info-container') {
                playerPhoto.src = 'images/placeholder.jpg'; 
                playerPhoto.alt = 'Выберите игрока';
                playerNickname.textContent = 'choose a player';
                playerDescription.textContent = 'on ur left';
            }
        });
    }
 
    aboutButton.addEventListener('click', () => {
        toggleScreens(playerInfoContainer, mainScreen, true);
    });
 
    playersNamesList.addEventListener('click', (event) => {
        if (!isContentVisible) {
            console.log("Контент скрыт для просмотра видео, клики по игрокам неактивны.");
            return;
        }

        const clickedElement = event.target;
        if (clickedElement.tagName === 'LI' && clickedElement.dataset.player) {
            document.querySelectorAll('#players-names-list li').forEach(li => {
                li.classList.remove('selected-player');
            });

            clickedElement.classList.add('selected-player');

            const playerId = clickedElement.dataset.player;
            const playerData = playersData[playerId];
 
            if (playerData) {
                playerPhoto.src = playerData.photo;
                playerPhoto.alt = 'Фото ' + playerData.nickname;
                playerNickname.textContent = playerData.nickname;
                playerDescription.textContent = playerData.description;
                
                playerDetailsDisplay.classList.remove('fade-in');
                void playerDetailsDisplay.offsetWidth;
                playerDetailsDisplay.classList.add('fade-in');
            } else {
                console.warn(`Данные для игрока с ID "${playerId}" не найдены.`);
                playerPhoto.src = 'images/placeholder.jpg';
                playerPhoto.alt = 'Ошибка загрузки';
                playerNickname.textContent = 'ОШИБКА';
                playerDescription.textContent = 'Не удалось загрузить данные об этом игроке.';
            }
        }
    });
 
    backButton.addEventListener('click', () => {
        toggleScreens(mainScreen, playerInfoContainer, false);
    });
});