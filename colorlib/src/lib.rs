pub mod color;

pub use color::hcl;
pub use color::hex;
pub use color::hsv;
pub use color::rgb;
pub use color::Color;

use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub struct ColorSquare {
    size: usize,
    pixels: Vec<u8>,
}

#[wasm_bindgen]
impl ColorSquare {
    #[wasm_bindgen(constructor)]
    pub fn new(size: usize) -> ColorSquare {
        let pixels = vec![0; size * size * 4];
        ColorSquare { size, pixels }
    }

    pub fn fill_chroma(&mut self, chroma: f64) {
        let mut next = self.pixels.clone();

        for row in 0..self.size {
            let lum = 1.0 - (1.0 / self.size as f64) * row as f64;
            for col in 0..self.size {
                let hue = (360.0 / self.size as f64) * col as f64;
                let hex_color = hex::Hex::from_hcl(hue, chroma, lum);
                let idx = self.size * 4 * row + col * 4;
                next[idx] = hex_color.r;
                next[idx + 1] = hex_color.g;
                next[idx + 2] = hex_color.b;
                next[idx + 3] = 255;
            }
        }

        self.pixels = next;
    }

    pub fn get_size(&self) -> usize {
        self.size
    }

    pub fn get_pixels_pointer(&self) -> *const u8 {
        self.pixels.as_ptr()
    }
}

#[wasm_bindgen]
pub struct ColorBar {
    width: usize,
    height: usize,
    pixels: Vec<u8>,
}

#[wasm_bindgen]
impl ColorBar {
    #[wasm_bindgen(constructor)]
    pub fn new(width: usize, height: usize) -> ColorBar {
        let pixels = vec![0; width * height * 4];
        ColorBar {
            width,
            height,
            pixels,
        }
    }

    pub fn fill_color(&mut self, hue: f64, lum: f64) {
        let mut next = self.pixels.clone();

        for row in 0..self.height {
            for col in 0..self.width {
                let chroma = (1.0 / self.width as f64) * col as f64;
                let hex_color = hex::Hex::from_hcl(hue, chroma, lum);
                let idx = self.width * 4 * row + col * 4;
                next[idx] = hex_color.r;
                next[idx + 1] = hex_color.g;
                next[idx + 2] = hex_color.b;
                next[idx + 3] = 255;
            }
        }

        self.pixels = next;
    }

    pub fn get_width(&self) -> usize {
        self.width
    }

    pub fn get_height(&self) -> usize {
        self.height
    }

    pub fn get_pixels_pointer(&self) -> *const u8 {
        self.pixels.as_ptr()
    }
}
