// App State
const state = {
  clips: [],
  filteredClips: [],
  selectedExpertise: null,
  isRecording: false,
  recordedBlob: null,
  recordingStartTime: null,
  mediaRecorder: null,
  stream: null,
};

// Sample Data
const initialClips = [
  {
    id: 1,
    title: "How to Negotiate Car Prices Like a Pro",
    expertise: "Negotiation & Sales",
    creator: "Marcus Chen",
    description: "Learn the exact tactics I use to save $2-3K on car purchases. Covers timing, research, and walking away.",
    duration: "4:32",
    thumbnail: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='225'%3E%3Crect fill='%233b82f6' width='400' height='225'/%3E%3C/svg%3E",
    video: null,
  },
  {
    id: 2,
    title: "Fixing a Generator: Complete Beginner's Guide",
    expertise: "Practical Skills",
    creator: "Sarah Williams",
    description: "Step-by-step guide to troubleshooting and fixing common generator issues. No experience needed.",
    duration: "5:00",
    thumbnail: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='225'%3E%3Crect fill='%231e40af' width='400' height='225'/%3E%3C/svg%3E",
    video: null,
  },
  {
    id: 3,
    title: "Perfect Sourdough in 5 Minutes (Setup Only!)",
    expertise: "Cooking & Food",
    creator: "Diego Morales",
    description: "I show you the exact workflow and timing I've perfected over 3 years. Includes my starter ratio.",
    duration: "4:45",
    thumbnail: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='225'%3E%3Crect fill='%23f59e0b' width='400' height='225'/%3E%3C/svg%3E",
    video: null,
  },
  {
    id: 4,
    title: "3 Techniques to Calm Interview Anxiety",
    expertise: "Career & Interviews",
    creator: "Priya Kapoor",
    description: "Practical breathing and mental techniques I use before every big interview. Works immediately.",
    duration: "3:50",
    thumbnail: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='225'%3E%3Crect fill='%2310b981' width='400' height='225'/%3E%3C/svg%3E",
    video: null,
  },
  {
    id: 5,
    title: "5-Minute Meditation for Anxiety Relief",
    expertise: "Wellness & Mindfulness",
    creator: "Lisa Chen",
    description: "A guided technique that I use daily. No prior experience needed. Immediate calm.",
    duration: "5:00",
    thumbnail: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='225'%3E%3Crect fill='%238b5cf6' width='400' height='225'/%3E%3C/svg%3E",
    video: null,
  },
  {
    id: 6,
    title: "Quick Watercolor Landscape Tricks",
    expertise: "Creative Arts",
    creator: "James Abbott",
    description: "Three simple techniques to add depth and life to your watercolor paintings.",
    duration: "4:20",
    thumbnail: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='225'%3E%3Crect fill='%23ec4899' width='400' height='225'/%3E%3C/svg%3E",
    video: null,
  },
];

// Initialize App
function init() {
  state.clips = initialClips;
  state.filteredClips = [...state.clips];
  renderClips();
  attachEventListeners();
}

// Event Listeners
function attachEventListeners() {
  // Share Button
  document.getElementById('shareBtn').addEventListener('click', () => {
    document.getElementById('recordModal').classList.add('active');
  });

  // Close Modals
  document.getElementById('closeRecordModal').addEventListener('click', () => {
    closeRecordModal();
  });
  document.getElementById('closeWatchModal').addEventListener('click', () => {
    document.getElementById('watchModal').classList.remove('active');
    stopVideoPlayback();
  });

  // Search
  document.getElementById('searchInput').addEventListener('input', (e) => {
    filterClips(e.target.value);
  });

  // Expertise Selection
  document.querySelectorAll('.expertise-option').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      document.querySelectorAll('.expertise-option').forEach((b) => {
        b.style.borderColor = '#cbd5e1';
        b.style.backgroundColor = 'white';
      });
      e.target.closest('button').style.borderColor = '#3b82f6';
      e.target.closest('button').style.backgroundColor = '#dbeafe';
      state.selectedExpertise = e.target.closest('button').dataset.expertise;
      document.getElementById('expertiseInput').value = state.selectedExpertise;
    });
  });

  // Recording Controls
  document.getElementById('startRecordBtn').addEventListener('click', startRecording);
  document.getElementById('stopRecordBtn').addEventListener('click', stopRecording);
  document.getElementById('retryRecordBtn').addEventListener('click', retryRecording);
  document.getElementById('cancelRecordBtn').addEventListener('click', closeRecordModal);

  // Form Submission
  document.getElementById('recordForm').addEventListener('submit', (e) => {
    e.preventDefault();
    submitClip();
  });
}

// Recording Functions
async function startRecording() {
  try {
    state.stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user' },
      audio: true,
    });

    const videoElement = document.getElementById('videoPreview');
    videoElement.srcObject = state.stream;
    videoElement.style.display = 'block';

    const options = { mimeType: 'video/webm' };
    if (!MediaRecorder.isTypeSupported(options.mimeType)) {
      options.mimeType = 'video/mp4';
    }

    state.mediaRecorder = new MediaRecorder(state.stream, options);
    const chunks = [];

    state.mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
    state.mediaRecorder.onstop = () => {
      state.recordedBlob = new Blob(chunks, { type: options.mimeType });
    };

    state.mediaRecorder.start();
    state.isRecording = true;
    state.recordingStartTime = Date.now();

    document.getElementById('recordingPrompt').style.display = 'none';
    document.getElementById('recordingControls').style.display = 'flex';

    // Auto-stop after 5 minutes
    setTimeout(() => {
      if (state.isRecording) {
        stopRecording();
      }
    }, 5 * 60 * 1000);
  } catch (err) {
    alert('Camera/microphone access denied. Please check your permissions.');
  }
}

function stopRecording() {
  if (state.mediaRecorder && state.isRecording) {
    state.mediaRecorder.stop();
    state.isRecording = false;

    if (state.stream) {
      state.stream.getTracks().forEach((track) => track.stop());
    }

    document.getElementById('recordingControls').style.display = 'none';
    document.getElementById('recordingPrompt').innerHTML =
      '<p class="text-green-600 mb-4">✓ Recording saved!</p><button type="button" class="record-btn" id="retryRecordBtn2">Record Again</button>';
    document.getElementById('retryRecordBtn2').addEventListener('click', retryRecording);
  }
}

function retryRecording() {
  state.recordedBlob = null;
  state.recordingStartTime = null;
  document.getElementById('videoPreview').style.display = 'none';
  document.getElementById('recordingPrompt').innerHTML =
    '<p class="text-slate-600 mb-4">📹 Click below to start recording</p><button type="button" class="record-btn" id="startRecordBtn">Start Recording</button>';
  document.getElementById('startRecordBtn').addEventListener('click', startRecording);
}

// Submit Clip
function submitClip() {
  const title = document.getElementById('titleInput').value.trim();
  const name = document.getElementById('nameInput').value.trim();
  const expertise = document.getElementById('expertiseInput').value;

  if (!title || !name || !expertise || !state.recordedBlob) {
    alert('Please fill in all fields and record a video.');
    return;
  }

  const videoUrl = URL.createObjectURL(state.recordedBlob);
  const newClip = {
    id: state.clips.length + 1,
    title,
    expertise,
    creator: name,
    description: `${name} shares their expertise on ${title.toLowerCase()}.`,
    duration: '5:00',
    thumbnail: 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22225%22%3E%3Crect fill=%22%233b82f6%22 width=%22400%22 height=%22225%22/%3E%3C/svg%3E',
    video: videoUrl,
  };

  state.clips.unshift(newClip);
  state.filteredClips = [...state.clips];
  renderClips();
  closeRecordModal();
  alert('✓ Your clip has been published!');
}

// Filter Clips
function filterClips(query) {
  const lowerQuery = query.toLowerCase();
  state.filteredClips = state.clips.filter(
    (clip) =>
      clip.title.toLowerCase().includes(lowerQuery) ||
      clip.expertise.toLowerCase().includes(lowerQuery) ||
      clip.creator.toLowerCase().includes(lowerQuery) ||
      clip.description.toLowerCase().includes(lowerQuery)
  );
  renderClips();
}

// Render Clips
function renderClips() {
  const container = document.getElementById('clipsContainer');
  const emptyState = document.getElementById('emptyState');

  container.innerHTML = '';

  if (state.filteredClips.length === 0) {
    emptyState.style.display = 'block';
    return;
  }

  emptyState.style.display = 'none';

  state.filteredClips.forEach((clip) => {
    const card = document.createElement('div');
    card.className = 'clip-card bg-white rounded-lg overflow-hidden';
    card.innerHTML = `
      <div class="relative h-40 cursor-pointer group" onclick="watchClip(${clip.id})">
        <img src="${clip.thumbnail}" alt="${clip.title}" class="w-full h-full object-cover">
        <div class="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition flex items-center justify-center">
          <div class="play-btn opacity-0 group-hover:opacity-100 transition">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </div>
        </div>
        <div class="absolute bottom-3 right-3">
          <span class="duration-badge">${clip.duration}</span>
        </div>
      </div>
      <div class="p-4">
        <h3 class="font-semibold text-slate-900 mb-2 line-clamp-2">${clip.title}</h3>
        <div class="flex items-center gap-2 mb-3">
          <div class="w-8 h-8 rounded-full gradient-accent"></div>
          <div class="text-sm">
            <p class="font-medium text-slate-900">${clip.creator}</p>
            <p class="text-xs text-slate-600">${clip.expertise}</p>
          </div>
        </div>
        <div class="mb-3">
          <span class="expertise-tag">${clip.expertise}</span>
        </div>
        <p class="text-sm text-slate-600 line-clamp-2">${clip.description}</p>
      </div>
    `;
    container.appendChild(card);
  });
}

// Watch Clip
function watchClip(id) {
  const clip = state.clips.find((c) => c.id === id);
  if (!clip) return;

  document.getElementById('watchTitle').textContent = clip.title;
  document.getElementById('watchName').textContent = clip.creator;
  document.getElementById('watchExpertise').textContent = clip.expertise;
  document.getElementById('watchDescription').textContent = clip.description;

  const videoElement = document.getElementById('watchVideo');
  if (clip.video) {
    videoElement.src = clip.video;
    videoElement.style.display = 'block';
  } else {
    videoElement.style.display = 'none';
  }

  document.getElementById('watchModal').classList.add('active');
}

function stopVideoPlayback() {
  const videoElement = document.getElementById('watchVideo');
  if (videoElement) {
    videoElement.pause();
    videoElement.currentTime = 0;
  }
}

// Close Record Modal
function closeRecordModal() {
  document.getElementById('recordModal').classList.remove('active');
  document.getElementById('recordForm').reset();
  document.querySelectorAll('.expertise-option').forEach((b) => {
    b.style.borderColor = '#cbd5e1';
    b.style.backgroundColor = 'white';
  });
  state.selectedExpertise = null;
  state.recordedBlob = null;
  document.getElementById('videoPreview').style.display = 'none';
  document.getElementById('recordingPrompt').innerHTML =
    '<p class="text-slate-600 mb-4">📹 Click below to start recording</p><button type="button" class="record-btn" id="startRecordBtn">Start Recording</button>';
  document.getElementById('startRecordBtn').addEventListener('click', startRecording);
}

// Close on outside click
document.getElementById('recordModal').addEventListener('click', (e) => {
  if (e.target === document.getElementById('recordModal')) {
    closeRecordModal();
  }
});

document.getElementById('watchModal').addEventListener('click', (e) => {
  if (e.target === document.getElementById('watchModal')) {
    document.getElementById('watchModal').classList.remove('active');
    stopVideoPlayback();
  }
});

// Start App
init();