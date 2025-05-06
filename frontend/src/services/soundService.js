// src/services/SoundService.js

class SoundService {
    constructor() {
      this.sounds = {};
      this.isMuted = false;
      this.initialized = false;
    }
    
    init() {
      if (this.initialized) return this;
      
      // Register sound resources
      this.register('ringtone', '/sounds/ringtone.mp3');
      this.register('callConnect', '/sounds/call-connect.mp3');
      this.register('callEnd', '/sounds/call-end.mp3');
      
      this.initialized = true;
      return this;
    }
  
    register(name, path) {
      try {
        this.sounds[name] = new Audio(path);
        
        // Set ringtone to loop
        if (name === 'ringtone') {
          this.sounds[name].loop = true;
        }
      } catch (err) {
        console.error(`Error registering sound ${name}:`, err);
      }
      
      return this;
    }
  
    play(name) {
      if (this.isMuted || !this.sounds[name]) return;
      
      try {
        // For ringtone, stop other sounds first
        if (name === 'ringtone') {
          this.stopAll();
        }
        
        const sound = this.sounds[name];
        sound.currentTime = 0;
        
        // Play with promise handling for browsers that require user interaction
        const playPromise = sound.play();
        
        if (playPromise !== undefined) {
          playPromise.catch(err => {
            console.error(`Error playing sound ${name}:`, err);
          });
        }
      } catch (err) {
        console.error(`Error playing sound ${name}:`, err);
      }
    }
  
    stop(name) {
      if (!this.sounds[name]) return;
      
      try {
        const sound = this.sounds[name];
        sound.pause();
        sound.currentTime = 0;
      } catch (err) {
        console.error(`Error stopping sound ${name}:`, err);
      }
    }
  
    stopAll() {
      Object.keys(this.sounds).forEach(name => {
        this.stop(name);
      });
    }
  
    mute() {
      this.isMuted = true;
      this.stopAll();
    }
  
    unmute() {
      this.isMuted = false;
    }
  }
  
  // Create a singleton instance
  const soundService = new SoundService();
  soundService.init();
  
  export default soundService;