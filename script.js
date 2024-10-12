let audioContext;
let analyser;
let microphone;
let scriptProcessor;
let measuring = false;

document.getElementById('start-measuring').addEventListener('click', () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(function(stream) {
                audioContext = new (window.AudioContext || window.webkitAudioContext)();
                analyser = audioContext.createAnalyser();
                microphone = audioContext.createMediaStreamSource(stream);
                scriptProcessor = audioContext.createScriptProcessor(2048, 1, 1);

                analyser.smoothingTimeConstant = 0.8;
                analyser.fftSize = 1024;

                microphone.connect(analyser);
                analyser.connect(scriptProcessor);
                scriptProcessor.connect(audioContext.destination);

                measuring = true;
                document.getElementById('stop-measuring').disabled = false;
                document.getElementById('start-measuring').disabled = true;

                const canvas = document.getElementById('noiseGraph');
                const canvasCtx = canvas.getContext('2d');

                scriptProcessor.onaudioprocess = function() {
                    if (!measuring) return;

                    const array = new Uint8Array(analyser.frequencyBinCount);
                    analyser.getByteFrequencyData(array);

                    const values = [];
                    for (let i = 0; i < array.length; i++) {
                        values.push(array[i]);
                    }

                    canvasCtx.clearRect(0, 0, canvas.width, canvas.height);

                    // Draw grid
                    canvasCtx.beginPath();
                    for (let i = 0; i < canvas.width; i += 50) {
                        canvasCtx.moveTo(i, 0);
                        canvasCtx.lineTo(i, canvas.height);
                    }
                    for (let j = 0; j < canvas.height; j += 50) {
                        canvasCtx.moveTo(0, j);
                        canvasCtx.lineTo(canvas.width, j);
                    }
                    canvasCtx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
                    canvasCtx.stroke();

                    // Create gradient for the graph
                    const gradient = canvasCtx.createLinearGradient(0, 0, 0, canvas.height);
                    gradient.addColorStop(0, '#00FFFF'); // Start with Cyan
                    gradient.addColorStop(0.5, '#00FF7F'); // Middle with Light Green
                    gradient.addColorStop(1, '#FF00FF'); // End with Magenta

                    canvasCtx.strokeStyle = gradient; // Apply the gradient
                    canvasCtx.lineWidth = 0.5;  // Thinner lines for better visibility
                    canvasCtx.setLineDash([5, 3]);  // Dotted lines

                    // Draw the graph
                    for (let i = 0; i < values.length; i++) {
                        const x = (i / values.length) * canvas.width;
                        const y = canvas.height - (values[i] / 255 * canvas.height);
                        canvasCtx.beginPath();
                        canvasCtx.moveTo(x, canvas.height);
                        canvasCtx.lineTo(x, y);
                        canvasCtx.stroke();
                    }
                    canvasCtx.setLineDash([]); // Reset to solid

                    // Add labels
                    canvasCtx.fillStyle = 'white';
                    canvasCtx.font = '16px Arial';
                    const average = values.reduce((a, b) => a + b) / values.length;
                    if (average > 0) {
                        document.getElementById('decibel-level').innerText = Math.round(average);
                    } else {
                        document.getElementById('decibel-level').innerText = 'Measuring...';
                    }
                };
            })
            .catch(function(err) {
                console.error("The following gUM error occurred: " + err);
            });
    } else {
        console.error('getUserMedia not supported on your browser!');
    }
});

document.getElementById('stop-measuring').addEventListener('click', () => {
    measuring = false;
    microphone.disconnect();
    analyser.disconnect();
    scriptProcessor.disconnect();
    document.getElementById('stop-measuring').disabled = true;
    document.getElementById('start-measuring').disabled = false;
});
