console.log("Let's write some JS");

let songs = new Array();
let currSong = new Audio();
let playCurrSong = document.querySelector("#curr"), volumeBar = document.querySelector("#volume");
let prev = 0, curr = 0, currVolume = volumeBar.value;
currSong.volume = currVolume / 100;

let getSongs = async (folder) => {
    let fetchSongs = await fetch(`/Projects/Spotify%20Clone%20(HTML,%20CSS,%20JS)/assets/songs/${folder}`);
    let response = await fetchSongs.text();
    let songs = [];
    let div = document.createElement('div');
    div.innerHTML = response;
    let a_s = div.getElementsByTagName('a');

    for (let a of a_s) {
        if (a.href.endsWith(".mp3")) {
            songs.push(a.href);
        }
    }

    return songs;
}

let songCardHTML = (songName) => {
    return `<li class="pointer">
                <div class="music">
                    <img src="../assets/svg/music-note-02.svg" alt="music-note">
                </div>

                <div class="song-info">
                    <div class="name">
                        ${songName}
                    </div>
                    <div class="artist">
                        Artist
                    </div>
                </div>

                <div class="play-now">
                    <img src="../assets/svg/play2.svg" alt="play-btn">
                </div>
            </li>`;
}

let showSongs = (songs) => {
    // Show all the songs in the Playlist...
    let songUL = document.querySelector('.songlist>ul');

    songUL.innerHTML = "";
    for (let song of songs) {
        let songName = song.split("/Spotify%20")[1].replaceAll("%20", " ").split("-")[1].replace(".mp3", "").trim();
        songUL.innerHTML += songCardHTML(songName);
    }

    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach((song, i) => {
        let musicSrc = songs[i];
        song.addEventListener('click', () => {
            playMusic(musicSrc, false, i);
        });
    });
}

// Create a function to Load the Albums.
const loadCards = async (folder) => {
    let fetchAlbums = await fetch(`/Projects/Spotify%20Clone%20(HTML,%20CSS,%20JS)/assets/songs/${folder}/info.json`);
    let response = await fetchAlbums.json();

    let cardProto = `<div data-folder=${folder} class="card flex pointer">
                        <div class="play flex items-center justify-center">
                            <img src="../assets/svg/play.svg" alt="play button">
                        </div>
                        <div class="card-img">
                            <img src="../assets/songs/${folder}/cover-image.jpg" alt="cover-image">
                        </div>

                        <div class="song-title">
                            <p>${response.title}</p>
                        </div>

                        <div class="artists" data-encore-id="text">
                            <p>${response.artists}</p>
                        </div>
                    </div>`

    document.querySelector(".card-container").innerHTML += cardProto;
    addEventToAlbum();
}

// Add an Event Listner to the Card in the Right Tab.
const addEventToAlbum = () => {
    Array.from(document.querySelectorAll(".card")).forEach((card) => {
        card.addEventListener('click', async (evt) => {
            songs = await getSongs(evt.currentTarget.dataset.folder);
            showSongs(songs);
            playMusic(songs[0], false, 0);
        });
    });
}

// Load all the Albums into the App.
const loadAlbums = async () => {
    let fetchAlbums = await fetch(`/Projects/Spotify%20Clone%20(HTML,%20CSS,%20JS)/assets/songs`);
    let response = await fetchAlbums.text();

    let div = document.createElement('div');
    div.innerHTML = response;

    let anchors = div.getElementsByTagName('a');

    Array.from(anchors).forEach((item) => {
        if (item.href.includes('/songs/')) {
            let currFolder = item.href.split("/songs/")[1].split('/')[0];
            loadCards(currFolder);
        }
    })
}

let playMusic = (musicSrc, paused = false, i) => {
    currSong.src = musicSrc;
    if (!paused) {
        currSong.play();
        playCurrSong.src = "../assets/svg/play-btn.svg";
        updateSongItem(i);
        curr = i;
    }

    document.querySelector(".song-name").innerHTML = `<p>${decodeURI(musicSrc).split("- ")[1].split(".mp3")[0]}</p>`;
}

const updateSongItem = (i) => {
    let songItems = document.querySelectorAll(".songlist .play-now img");
    let songName = document.querySelectorAll(".songlist .name");
    songItems[prev].src = `../assets/svg/play2.svg`;
    songItems[i].src = `../assets/svg/music-play-indicator.svg`;

    songName[prev].classList.remove("green-color");
    songName[i].classList.add("green-color");
    prev = i;
}

let toggleSongState = (i) => {
    if (currSong.src != "") {
        if (currSong.paused) {
            currSong.play();
            playCurrSong.src = "../assets/svg/play-btn.svg"
            updateSongItem(i);
        } else {
            currSong.pause();
            playCurrSong.src = "../assets/svg/pause-btn.svg";
        }
    }
}

let secondsToMinuteSeconds = (seconds) => {
    if (isNaN(seconds)) {
        return '00:00'
    }
    let min = Math.floor(seconds / 60);
    let sec = Math.floor(seconds) % 60;
    return `${min < 10 ? "0" + min : min}:${sec < 10 ? "0" + sec : sec}`;
}

let updateTime = (songs) => {
    let currState = document.querySelector(".curr-state");
    document.querySelector(".currsong-time").innerHTML = secondsToMinuteSeconds(currSong.currentTime);
    document.querySelector(".duration").innerHTML = secondsToMinuteSeconds(currSong.duration);
    let percent = (currSong.currentTime / currSong.duration) * 100;
    document.querySelector(".circle").style.left = `${percent - .8}%`;
    currState.style.width = `${percent}%`;

    if (currSong.currentTime == currSong.duration) {
        curr = (curr + 1) % songs.length;
        playMusic(songs[curr], false, curr);
    }
}

let loadWhenOpened = (song) => {
    playMusic(song, true, 0);
    document.querySelector(".currsong-time").innerHTML = secondsToMinuteSeconds(currSong.currentTime);
}

let seek = () => {
    document.querySelector(".seek-bar").addEventListener("click", e => {
        const seekBar = document.querySelector(".seek-bar");
        let currState = document.querySelector(".curr-state");
        let rect = seekBar.getBoundingClientRect().width;
        let percent = (e.offsetX / rect) * 100;
        document.querySelector(".circle").style.left = `${e.clientX - rect.left}`;
        currSong.currentTime = (percent * currSong.duration) / 100;
        currState.style.width = `${percent}%`
    });
}

// Add an Event Listner to previous and Next.
const previousAndNextEvents = (songs) => {
    document.querySelector("#prev").addEventListener('click', () => {
        // console.log(currSong);
        if (curr > 0) {
            let prevSongIdx = curr - 1;
            playMusic(songs[prevSongIdx], false, prevSongIdx);
        } else {
            playMusic(songs[0], false, 0);
        }
    });

    document.querySelector("#next").addEventListener('click', () => {
        // console.log("Next was clicked");
        // console.log(currSong);
        // console.log(songs[curr + 1]);
        let nextSongIdx = (curr + 1) % songs.length;
        playMusic(songs[nextSongIdx], false, nextSongIdx);
    });
}

const updateVolume = () => {
    let volumeImg = document.querySelector(".volume-controls img");

    volumeBar.addEventListener("change", (e) => {
        currVolume = e.target.value;
        // console.log(e.target.value);
        currSong.volume = currVolume / 100;

        if (currSong.muted) {
            currSong.muted = false;
            volumeImg.src = `../assets/svg/volume-up.svg`;
        }
    });

    volumeImg.addEventListener("click", () => {
        if (currSong.muted) {
            currSong.muted = false;
            volumeBar.value = (currSong.volume = currVolume / 100) * 100;
            volumeImg.src = `../assets/svg/volume-up.svg`;
        } else {
            volumeBar.value = 0;
            currSong.muted = true;
            volumeImg.src = `../assets/svg/volume-mute.svg`;
        }
    });
}

async function main() {
    await loadAlbums('Salaar');

    songs = await getSongs(`Salaar`);
    // console.log(songs);
    showSongs(songs);
    loadWhenOpened(songs[0]);

    // // Code to Play the Song...
    // var audio = new Audio(songs[0]);
    // // audio.play();


    playCurrSong.addEventListener('click', () => {
        toggleSongState(curr);
    });

    currSong.addEventListener("timeupdate", () => {
        updateTime(songs);
    });

    // Attach an event listner to menu icon
    document.querySelector("#menu").addEventListener('click', () => {
        document.querySelector(".left").style.left = 0;
    });

    // Attach an event listner to menu icon
    document.querySelector("#close").addEventListener('click', () => {
        document.querySelector(".left").style.left = `-100%`;
    });

    seek();
    previousAndNextEvents(songs);
    updateVolume();
}

main();
