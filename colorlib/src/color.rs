//! Color Library
//!
//! This module contains structures representing Hex, RGB, HSV, and HCL color
//! spaces and methods for converting among them. The `Color` struct is a
//! container for a color represented in all 4 color spaces.
//!
//! Example:
//!
//! ```
//! use colorlib::Color;
//!
//! let color = Color::from_hex("F00");
//! ```

pub mod calc;
pub mod hcl;
pub mod hex;
pub mod hsv;
pub mod rgb;
pub mod util;

pub use hcl::HCL;
pub use hex::Hex;
pub use hsv::HSV;
pub use rgb::RGB;
use wasm_bindgen::prelude::*;

// -----
// Enums
// -----

#[wasm_bindgen]
#[allow(non_camel_case_types)]
pub enum Component {
    RGB_R,
    RGB_G,
    RGB_B,
    HSV_H,
    HSV_S,
    HSV_V,
    HCL_H,
    HCL_C,
    HCL_L,
}

// ----------------
// Color Structures
// ----------------
//
/// Represents a color in various spaces.
///
/// `Color` holds a single color in four color spaces: Hex, RGB, HSV, and
/// HCL. It can be constructed from any of those four components.
///
/// # Example:
///
/// ```
/// use colorlib::Color;
///
/// let red = Color::from_hex("F00");
/// ```
#[wasm_bindgen]
#[derive(Clone, Copy, Debug, PartialEq)]
pub struct Color {
    pub hex: Hex,
    pub rgb: RGB,
    pub hsv: HSV,
    pub hcl: HCL,
}

// Color Methods

#[wasm_bindgen]
impl Color {
    /// Creates a new Color struct from a hex code string.
    ///
    /// # Example:
    ///
    /// ```
    /// use colorlib::Color;
    ///
    /// let red = Color::from_hex("FF0000");
    /// ```
    pub fn from_hex(code: &str) -> Color {
        let hex = Hex::from_code(&code);
        let rgb = RGB::from_hex(&code);
        let hsv = HSV::from_hex(&code);
        let hcl = HCL::from_hex(&code);
        Color { hex, rgb, hsv, hcl }
    }

    /// Creates a new Color struct from floating point RGB values.
    ///
    /// # Example:
    ///
    /// ```
    /// use colorlib::Color;
    ///
    /// let red = Color::from_rgb(255.0, 0.0, 0.0);
    /// ```
    pub fn from_rgb(r: f64, g: f64, b: f64) -> Color {
        let hex = Hex::from_rgb(r, g, b);
        let rgb = RGB::new(r, g, b);
        let hsv = HSV::from_rgb(r, g, b);
        let hcl = HCL::from_rgb(r, g, b);
        Color { hex, rgb, hsv, hcl }
    }

    /// Creates a new Color struct from floating point HSV values.
    ///
    /// # Example:
    ///
    /// ```
    /// use colorlib::Color;
    ///
    /// let red = Color::from_hsv(0.0, 1.0, 1.0);
    /// ```
    pub fn from_hsv(h: f64, s: f64, v: f64) -> Color {
        let hex = Hex::from_hsv(h, s, v);
        let rgb = RGB::from_hsv(h, s, v);
        let hsv = HSV::new(h, s, v);
        let hcl = HCL::from_hsv(h, s, v);
        Color { hex, rgb, hsv, hcl }
    }

    /// Creates a new Color struct from floating point HCL values.
    ///
    /// # Example:
    ///
    /// ```
    /// use colorlib::Color;
    ///
    /// let red = Color::from_hcl(0.0, 1.0, 0.55);
    /// ```
    pub fn from_hcl(h: f64, c: f64, l: f64) -> Color {
        let hex = Hex::from_hcl(h, c, l);
        let rgb = RGB::from_hcl(h, c, l);
        let hsv = HSV::from_hcl(h, c, l);
        let hcl = HCL::new(h, c, l);
        Color { hex, rgb, hsv, hcl }
    }

    pub fn get(&self, component: Component) -> f64 {
        match component {
            Component::RGB_R => self.rgb.r,
            Component::RGB_G => self.rgb.g,
            Component::RGB_B => self.rgb.b,
            Component::HSV_H => self.hsv.h,
            Component::HSV_S => self.hsv.s,
            Component::HSV_V => self.hsv.v,
            Component::HCL_H => self.hcl.h,
            Component::HCL_C => self.hcl.c,
            Component::HCL_L => self.hcl.l,
        }
    }

    pub fn update(&self, component: Component, value: f64) -> Color {
        match component {
            Component::RGB_R => Color::from_rgb(value, self.rgb.g, self.rgb.b),
            Component::RGB_G => Color::from_rgb(self.rgb.r, value, self.rgb.b),
            Component::RGB_B => Color::from_rgb(self.rgb.r, self.rgb.g, value),
            Component::HSV_H => Color::from_hsv(value, self.hsv.s, self.hsv.v),
            Component::HSV_S => Color::from_hsv(self.hsv.h, value, self.hsv.v),
            Component::HSV_V => Color::from_hsv(self.hsv.h, self.hsv.s, value),
            Component::HCL_H => Color::from_hcl(value, self.hcl.c, self.hcl.l),
            Component::HCL_C => Color::from_hcl(self.hcl.h, value, self.hcl.l),
            Component::HCL_L => Color::from_hcl(self.hcl.h, self.hcl.c, value),
        }
    }

    /// Checks if two Color objects are equal
    ///
    /// # Example:
    ///
    /// ```
    /// use colorlib::Color;
    ///
    /// let color1 = Color::from_hex("FF0000");
    /// let color2 = Color::from_hex("FF0000");
    /// assert!(color1.equals(&color2));
    /// ```
    pub fn equals(&self, other: &Color) -> bool {
        self == other
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    mod test_color {
        use super::*;

        #[test]
        fn color_from_hex() {
            let hex_code = "4C964B";
            let (hr, hg, hb) = (76u8, 150u8, 75u8);
            let (r, g, b) = (76.0, 150.0, 75.0);
            let (h1, s, v) = (119.2, 0.5, 0.5882352941176471);
            let (h2, c, l) = (119.2, 0.5, 0.4894232967469906);

            let color = Color::from_hex(&hex_code);
            assert_eq!(color.hex.to_code(), hex_code.to_string());
            assert_eq!(color.hex.r, hr);
            assert_eq!(color.hex.g, hg);
            assert_eq!(color.hex.b, hb);
            assert_eq!(color.rgb.r, r);
            assert_eq!(color.rgb.g, g);
            assert_eq!(color.rgb.b, b);
            assert_eq!(color.hsv.h, h1);
            assert_eq!(color.hsv.s, s);
            assert_eq!(color.hsv.v, v);
            assert_eq!(color.hcl.h, h2);
            assert_eq!(color.hcl.c, c);
            assert_eq!(color.hcl.l, l);
        }

        #[test]
        fn color_from_rgb() {
            let hex_code = "4C964B";
            let (hr, hg, hb) = (76u8, 150u8, 75u8);
            let (r, g, b) = (76.0, 150.0, 75.0);
            let (h1, s, v) = (119.2, 0.5, 0.5882352941176471);
            let (h2, c, l) = (119.2, 0.5, 0.4894232967469906);

            let color = Color::from_rgb(r, g, b);
            assert_eq!(color.hex.to_code(), hex_code.to_string());
            assert_eq!(color.hex.r, hr);
            assert_eq!(color.hex.g, hg);
            assert_eq!(color.hex.b, hb);
            assert_eq!(color.rgb.r, r);
            assert_eq!(color.rgb.g, g);
            assert_eq!(color.rgb.b, b);
            assert_eq!(color.hsv.h, h1);
            assert_eq!(color.hsv.s, s);
            assert_eq!(color.hsv.v, v);
            assert_eq!(color.hcl.h, h2);
            assert_eq!(color.hcl.c, c);
            assert_eq!(color.hcl.l, l);
        }

        #[test]
        fn color_from_hsv() {
            let hex_code = "4B964B";
            let (hr, hg, hb) = (75u8, 150u8, 75u8);
            let (r, g, b) = (75.225, 150.45, 75.225);
            let (h1, s, v) = (120.0, 0.5, 0.59);
            let (h2, c, l) = (120.0, 0.5, 0.4901795844381934);

            let color = Color::from_hsv(h1, s, v);
            assert_eq!(color.hex.to_code(), hex_code.to_string());
            assert_eq!(color.hex.r, hr);
            assert_eq!(color.hex.g, hg);
            assert_eq!(color.hex.b, hb);
            assert_eq!(color.rgb.r, r);
            assert_eq!(color.rgb.g, g);
            assert_eq!(color.rgb.b, b);
            assert_eq!(color.hsv.h, h1);
            assert_eq!(color.hsv.s, s);
            assert_eq!(color.hsv.v, v);
            assert_eq!(color.hcl.h, h2);
            assert_eq!(color.hcl.c, c);
            assert_eq!(color.hcl.l, l);
        }

        #[test]
        fn color_from_hcl() {
            let hex_code = "4B964B";
            let (hr, hg, hb) = (75u8, 150u8, 75u8);
            let (r, g, b) = (75.19744022437494, 150.3948804487499, 75.19744022437494);
            let (h1, s, v) = (120.0, 0.5, 0.5897838448970584);
            let (h2, c, l) = (120.0, 0.5, 0.49);

            let color = Color::from_hcl(h2, c, l);
            assert_eq!(color.hex.to_code(), hex_code.to_string());
            assert_eq!(color.hex.r, hr);
            assert_eq!(color.hex.g, hg);
            assert_eq!(color.hex.b, hb);
            assert_eq!(color.rgb.r, r);
            assert_eq!(color.rgb.g, g);
            assert_eq!(color.rgb.b, b);
            assert_eq!(color.hsv.h, h1);
            assert_eq!(color.hsv.s, s);
            assert_eq!(color.hsv.v, v);
            assert_eq!(color.hcl.h, h2);
            assert_eq!(color.hcl.c, c);
            assert_eq!(color.hcl.l, l);
        }
    }

    mod test_get {
        use super::*;

        #[test]
        fn get_rgb() {
            let color = Color::from_rgb(1.0, 2.0, 3.0);
            assert_eq!(color.get(Component::RGB_R), 1.0);
            assert_eq!(color.get(Component::RGB_G), 2.0);
            assert_eq!(color.get(Component::RGB_B), 3.0);
        }

        #[test]
        fn get_hsv() {
            let color = Color::from_hsv(120.0, 0.5, 1.0);
            assert_eq!(color.get(Component::HSV_H), 120.0);
            assert_eq!(color.get(Component::HSV_S), 0.5);
            assert_eq!(color.get(Component::HSV_V), 1.0);
        }

        #[test]
        fn get_hcl() {
            let color = Color::from_hcl(120.0, 0.5, 1.0);
            assert_eq!(color.get(Component::HCL_H), 120.0);
            assert_eq!(color.get(Component::HCL_C), 0.5);
            assert_eq!(color.get(Component::HCL_L), 1.0);
        }
    }

    mod test_update {
        use super::*;

        #[test]
        fn rgb_r() {
            let color = Color::from_rgb(0.0, 0.0, 0.0);
            let color = color.update(Component::RGB_R, 255.0);

            assert_eq!(color, Color::from_rgb(255.0, 0.0, 0.0));
        }

        #[test]
        fn rgb_g() {
            let color = Color::from_rgb(0.0, 0.0, 0.0);
            let color = color.update(Component::RGB_G, 255.0);

            assert_eq!(color, Color::from_rgb(0.0, 255.0, 0.0));
        }

        #[test]
        fn rgb_b() {
            let color = Color::from_rgb(0.0, 0.0, 0.0);
            let color = color.update(Component::RGB_B, 255.0);

            assert_eq!(color, Color::from_rgb(0.0, 0.0, 255.0));
        }

        #[test]
        fn hsv_h() {
            let color = Color::from_hsv(120.0, 1.0, 1.0);
            let color = color.update(Component::HSV_H, 240.0);

            assert_eq!(color, Color::from_hsv(240.0, 1.0, 1.0));
        }

        #[test]
        fn hsv_s() {
            let color = Color::from_hsv(120.0, 1.0, 1.0);
            let color = color.update(Component::HSV_S, 0.5);

            assert_eq!(color, Color::from_hsv(120.0, 0.5, 1.0));
        }

        #[test]
        fn hsv_v() {
            let color = Color::from_hsv(120.0, 1.0, 1.0);
            let color = color.update(Component::HSV_V, 0.5);

            assert_eq!(color, Color::from_hsv(120.0, 1.0, 0.5));
        }

        #[test]
        fn hcl_h() {
            let color = Color::from_hcl(120.0, 1.0, 1.0);
            let color = color.update(Component::HCL_H, 240.0);

            assert_eq!(color, Color::from_hcl(240.0, 1.0, 1.0));
        }

        #[test]
        fn hcl_s() {
            let color = Color::from_hcl(120.0, 1.0, 1.0);
            let color = color.update(Component::HCL_C, 0.5);

            assert_eq!(color, Color::from_hcl(120.0, 0.5, 1.0));
        }

        #[test]
        fn hcl_v() {
            let color = Color::from_hcl(120.0, 1.0, 1.0);
            let color = color.update(Component::HCL_L, 0.5);

            assert_eq!(color, Color::from_hcl(120.0, 1.0, 0.5));
        }
    }
}
