import * as use from '@tensorflow-models/universal-sentence-encoder';
import * as tf from '@tensorflow/tfjs';

// Load model only once (singleton)
let model = null;
let modelLoading = false;

async function loadModel() {
  if (model) return model;

  if (modelLoading) {
    // If model is already loading, wait
    while (modelLoading) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    return model;
  }

  modelLoading = true;
  try {
    model = await use.load();
    console.log("Universal Sentence Encoder model loaded.");
    return model;
  } catch (error) {
    console.error('Error loading USE model:', error);
    throw error;
  } finally {
    modelLoading = false;
  }
}

// Compute cosine similarity between two texts
export async function computeSimilarity(text1, text2) {
  try {
    if (!text1 || !text2) return 0;

    const useModel = await loadModel();

    const embeddings = await useModel.embed([text1, text2]);
    const embedArray = await embeddings.array();

    const vec1 = embedArray[0];
    const vec2 = embedArray[1];

    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;

    for (let i = 0; i < vec1.length; i++) {
      dotProduct += vec1[i] * vec2[i];
      norm1 += vec1[i] * vec1[i];
      norm2 += vec2[i] * vec2[i];
    }

    const similarity = dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));

    embeddings.dispose(); // Important: free memory

    return similarity;
  } catch (error) {
    console.error('Error computing similarity:', error);
    return 0; // fallback
  }
}
