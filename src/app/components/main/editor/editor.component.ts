declare var pdfjsLib:any;
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import * as mammoth from 'mammoth';

import { saveAs } from 'file-saver';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import { SharedModule } from '../../../shared.module';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-editor',
  imports: [SharedModule],
  templateUrl: './editor.component.html',
  styleUrl: './editor.component.scss',
})
export class EditorComponent implements OnInit {

  title = 'text-editor';
  inputText = '';
  synth: typeof speechSynthesis | null = null;

  constructor(){
    if (this.synth) {
      this.synth.cancel();
    }
  }
  utterance: SpeechSynthesisUtterance | null = null;
  isPaused = false;
  voices: SpeechSynthesisVoice[] = [];
  selectedVoice = '';
  mediaRecorder: MediaRecorder | null = null;
  audioChunks: Blob[] = [];
  isRecording = false;
  audioURL: string | null = null;
  showSpeechControls = false;
  @ViewChild('editorContainer') editorContainer!: ElementRef;
  editorConfig = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'], // toggled buttons
      ['blockquote', 'code-block'],
      ['link', 'formula'],
      [{ header: 1 }, { header: 2 }],
      [{ list: 'ordered' }, { list: 'bullet' }, { list: 'check' }],
      [{ script: 'sub' }, { script: 'super' }],
      [{ indent: '-1' }, { indent: '+1' }],
      [{ direction: 'rtl' }],
      [{ size: ['small', false, 'large', 'huge'] }],
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      [{ color: [] }, { background: [] }],
      [{ font: [] }],
      [{ align: [] }],
      ['clean'], // remove formatting button
    ],
  };
  loading: boolean = false;
  elapsedTime = 0; // Time in seconds
  timer: any;
  isRunning = false;

  get formattedTime(): string {
    const minutes = Math.floor(this.elapsedTime / 60);
    const seconds = this.elapsedTime % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  startTimer() {
    if (!this.isRunning) {
      this.isRunning = true;
      this.timer = setInterval(() => {
        this.elapsedTime++;
      }, 1000);
    }
  }

  stopTimer() {
    this.isRunning = false;
    clearInterval(this.timer);
  }
  ngOnInit(): void {
    this.loadVoices();
  }
  onChange() {
    this.showSpeechControls = !!this.inputText?.trim();
  }
  playSpeech() {
    const plainText = this.extractPlainText(this.inputText).trim();
    if (!plainText) {
      Swal.fire({
        title: 'Input Required!',
        text: 'Please enter some text.',
        icon: 'warning',
        confirmButtonText: 'OK'
      });
      return;
    }

    this.startRecording();
    this.utterance = new SpeechSynthesisUtterance(plainText);
    this.utterance.voice =
      this.voices.find((v) => v.name === this.selectedVoice) || null;
    this.utterance.onend = () => this.stopRecording();
    this.utterance.onboundary = (event) => this.highlightWord(event.charIndex);
    if (this.synth) {
      this.synth.speak(this.utterance);
    }
  }

  loadVoices() {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      this.synth = window.speechSynthesis;

      // Load voices asynchronously
      this.voices = this.synth.getVoices();
      // console.log('Voices initially:', this.voices);

      if (this.voices.length === 0) {
        // Listen for voiceschanged event
        this.synth.onvoiceschanged = () => {
          this.voices = this.synth!.getVoices();
          // console.log('Voices updated:', this.voices);
        };
      }
    }
  }

  async startRecording() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    this.mediaRecorder = new MediaRecorder(stream);
    this.audioChunks = [];
    this.mediaRecorder.ondataavailable = (event) =>
      this.audioChunks.push(event.data);
    this.mediaRecorder.onstop = () => {
      const audioBlob = new Blob(this.audioChunks, { type: 'audio/mp3' });
      this.audioURL = URL.createObjectURL(audioBlob);
    };
    this.mediaRecorder.start();
    this.isRecording = true;
  }

  stopRecording() {
    if (this.mediaRecorder && this.isRecording) {
      this.mediaRecorder.stop();
      this.isRecording = false;

      // Capture the audio as webm
      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' }); // Use webm format
        this.audioURL = URL.createObjectURL(audioBlob);
        // console.log('Generated Audio URL:', this.audioURL); // Debugging
      };
      // this.downloadAudio();
    }
  }

  downloadAudio() {
    if (!this.audioURL) {
       Swal.fire({
        title: 'No Audio Found!',
        text: 'No recorded audio available to download.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'OK',
        cancelButtonText: 'Cancel',
  });

      return;
    }

    // Fetch the audio blob from the recorded URL and save it
    fetch(this.audioURL)
      .then((response) => response.blob())
      .then((blob) => {
        // You can offer the WebM file directly or use an external service for MP3 conversion
        saveAs(blob, 'audio.webm'); // If you want to save it as webm

        // To save as MP3, you would need a server-side solution to convert WebM to MP3,
        // or a client-side library like ffmpeg.js for MP3 conversion.
        // Example: saveAs(mp3Blob, "audio.mp3"); // Assuming mp3Blob is the converted MP3.
      })
      .catch((error) => console.error('Error downloading audio:', error));
  }
  pauseSpeech() {
    if (this.synth && this.synth.speaking && !this.isPaused) {
      this.synth.pause();
      this.isPaused = true;
    }
  }
  resumeSpeech() {
    if (this.synth && this.synth.paused && this.isPaused) {
      this.synth.resume();
      this.isPaused = false;
    }
  }
  stopSpeech() {
    if (this.synth && (this.synth.speaking || this.synth.paused)) {
      if (this.synth) {
        this.synth.cancel(); // Stop speech immediately
      }
      this.utterance = null;
      this.isPaused = false;
      this.stopRecording();
      this.removeHighlights();
    }
  }
  onVoiceChange(event: any) {
    this.selectedVoice = event.target.value;
  }
  highlightWord(charIndex: number) {
    const words = this.inputText.split(' ');
    let currentWordIndex = 0;
    let charCount = 0;

    for (let i = 0; i < words.length; i++) {
      charCount += words[i].length + 1;
      if (charIndex < charCount) {
        currentWordIndex = i;
        break;
      }
    }
    this.highlightSpokenText(currentWordIndex);
  }

  highlightSpokenText(index: number = -1) {
    if (!this.editorContainer) return;

    const editor =
      this.editorContainer.nativeElement.querySelector('.ql-editor');
    if (!editor) return;

    const words = editor.innerHTML.split(' ');
    this.removeHighlights();
    if (index >= 0 && index < words.length) {
      words[index] = `<span class="highlight">${words[index]}</span>`;
      editor.innerHTML = words.join(' ');
    }
  }

  removeHighlights() {
    const editor =
      this.editorContainer.nativeElement.querySelector('.ql-editor');
    editor.innerHTML = this.inputText;
  }
  extractPlainText(html: any) {
    const tempElement = document.createElement('div');
    tempElement.innerHTML = html;
    return tempElement.textContent || tempElement.innerText || '';
  }
  async extractTextFromPDF(event: any) {
    try {
      
  
    this.loading = true;
    this.inputText = ' ';
    this.stopSpeech();
  
    const file = event.target.files[0];
    if (!file) return console.error('No file selected');
  
    if (file.type !== 'application/pdf') {
      Swal.fire({
        title: 'Invalid File!',
        text: 'Please select a valid PDF file.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
      return;
    }
  
    const reader = new FileReader();
    reader.readAsArrayBuffer(file);
  
    reader.onload = async () => {
      if (!reader.result) return;
  
      const pdf = await pdfjsLib.getDocument({ data: reader.result }).promise;
      const maxPages = pdf.numPages;
      let text = '';
  
      for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const content = await page.getTextContent();
  
        // Preserve spaces & newlines based on positioning
        const pageText = content.items
          .map((item: any) => {
            const str = ('str' in item ? item.str : '');
            const space = item.hasEOL ? '\n' : ' '; // Handle line breaks
            return str + space;
          })
          .join('');
  
        text += pageText + '\n\n'; // Ensure paragraph separation
      }
  
    
      this.inputText = text.trim();
      this.showSpeechControls = true;
    };
  } catch (error) {
      console.log(error)
  }
  finally{
    this.loading = false;
  }
  }
  

  async extractTextFromWord(event: any) {
    this.loading = true;
    this.inputText = ''; // Clear inputText immediately
    this.stopSpeech()
  
    const file = event.target.files[0];
    if (!file) {
      this.loading = false;
      return;
    }
  
    const validExtensions = [
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
  
    if (!validExtensions.includes(file.type)) {
      Swal.fire({
        title: 'Invalid File!',
        text: 'Please select a valid Word file.',
        icon: 'error',
        confirmButtonText: 'OK'
      })
      this.loading = false;
      return;
    }
  
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const result = await mammoth.extractRawText({
          arrayBuffer: e.target!.result as ArrayBuffer,
        });
        this.inputText = result.value; // Set extracted text
        this.showSpeechControls = true;
      } catch (error) {
        Swal.fire({
          title: 'Extraction Error!',
          text: 'An error occurred while extracting text.',
          icon: 'error',
          confirmButtonText: 'OK'
        });
      } finally {
        this.loading = false; // Ensure loading is disabled after processing
      }
    };
    reader.readAsArrayBuffer(file);
  }
  

  async shareAsWord() {
    const plainText = this.extractPlainText(this.inputText).trim();

    try {
      // Fetch a DOCX template from assets or server
      const response = await fetch('/assets/template.docx'); // Ensure this file exists
      const arrayBuffer = await response.arrayBuffer();
      // Load the file into PizZip
      const zip = new PizZip(arrayBuffer);
      const doc = new Docxtemplater(zip);
      // Set the data
      doc.setData({ text: plainText });

      // Render the document
      doc.render();

      // Generate the final DOCX file
      const output = doc.getZip().generate({
        type: 'blob',
        mimeType:
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      });

      saveAs(output, 'document.docx');
    } catch (error) {
      console.error('Error generating DOCX:', error);
    }
  }
}
