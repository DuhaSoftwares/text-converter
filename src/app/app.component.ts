import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import * as mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist';
import { SharedModule } from './shared.module';
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs',import.meta.url).toString()
import { saveAs } from 'file-saver';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: true,
  imports: [SharedModule]
})
export class AppComponent implements OnInit, AfterViewInit {
  title = 'text-editor';
  inputText = '';
  synth: typeof speechSynthesis | null = null;;
  utterance: SpeechSynthesisUtterance | null = null;
  isPaused = false;
  voices: SpeechSynthesisVoice[] = [];
  selectedVoice = '';
  mediaRecorder: MediaRecorder | null = null;
  audioChunks: Blob[] = [];
  isRecording = false;
  audioURL: string | null = null;
  @ViewChild('editorContainer') editorContainer!: ElementRef;

  ngOnInit(): void {
    this.loadVoices();
  }

  ngAfterViewInit(): void {
      this.highlightSpokenText();
  }

  onContentChanged(event: any) {
    this.inputText = event.text.trim();
  }

  playSpeech() {
    const plainText = this.extractPlainText(this.inputText).trim();
    if (!plainText) {
      alert('Please enter some text.');
      return;
    }

    this.startRecording();
    this.utterance = new SpeechSynthesisUtterance(plainText);
    this.utterance.voice = this.voices.find(v => v.name === this.selectedVoice) || null;
    this.utterance.onend = () => this.stopRecording();
    this.utterance.onboundary = (event) => this.highlightWord(event.charIndex);
    if (this.synth) {
      this.synth.speak(this.utterance);
    }
  }

  extractPlainText(html: any) {
    const tempElement = document.createElement('div');
    tempElement.innerHTML = html;
    return tempElement.textContent || tempElement.innerText || '';
  }

  loadVoices() {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      this.synth = window.speechSynthesis;
      if (this.synth) {
        if (this.synth) {
          if (this.synth) {
            this.voices = this.synth.getVoices();
            console.log('Voices:', this.voices);
          }
        }
      }
    }
  }

  async startRecording() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    this.mediaRecorder = new MediaRecorder(stream);
    this.audioChunks = [];
    this.mediaRecorder.ondataavailable = (event) => this.audioChunks.push(event.data);
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
    }
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

    const editor = this.editorContainer.nativeElement.querySelector('.ql-editor');
    if (!editor) return;

    const words = editor.innerHTML.split(' ');
    this.removeHighlights();
    if (index >= 0 && index < words.length) {
      words[index] = `<span class="highlight">${words[index]}</span>`;
      editor.innerHTML = words.join(' ');
    }
  }

  removeHighlights() {
    const editor = this.editorContainer.nativeElement.querySelector('.ql-editor');
    editor.innerHTML = this.inputText;
  }

 async extractTextFromPDF(event: any) {
  const file = event.target.files[0]; // Fix file selection
  if (!file) return console.error('No file selected');

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

      // Use type assertion to fix 'str' property error
      const pageText = content.items
        .map((item) => ('str' in item ? item.str : ''))
        .join('\n');

      text += pageText + '\n';
    }

    this.inputText = text;
    console.log('Extracted text:', text);
  };
}

  async extractTextFromWord(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const result = await mammoth.extractRawText({ arrayBuffer: e.target!.result as ArrayBuffer });
      this.inputText = result.value;
    };
    reader.readAsArrayBuffer(file);
  }


  downloadAudio() {
    if (this.audioURL) {
      saveAs(this.audioURL, 'audio.mp3');
    }
  }

 shareAsWord() {
  const plainText = this.extractPlainText(this.inputText).trim();
  
  // Create a new zip-based Word document
  const zip = new PizZip();
  const doc = new Docxtemplater(zip);
  // Load content
  doc.loadZip(zip);
  doc.setData({ text: plainText });

  try {
    doc.render();
    const output = doc.getZip().generate({ type: 'blob', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
    saveAs(output, 'document.docx');
  } catch (error) {
    console.error("Error generating DOCX:", error);
  }
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
    this.synth.cancel();
    this.isPaused = false;
    this.stopRecording();
    this.removeHighlights();
  }
  }
  onVoiceChange(event: any) {
  this.selectedVoice = event.target.value;
}
}