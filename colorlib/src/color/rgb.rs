use crate::color::calc;
use crate::color::hex::Hex;
use crate::color::hsv::HSV;
use crate::color::util;
use wasm_bindgen::prelude::*;

/// Represents a color in RGB space
///
/// Holds three color components:
/// - R: Red
/// - G: Green
/// - B: Blue
///
/// # Example:
///
/// ```
/// use colorlib::rgb::RGB;
///
/// let red = RGB::new(255.0, 0.0, 0.0);
/// ```
#[wasm_bindgen]
#[derive(Clone, Copy, Debug, PartialEq)]
pub struct RGB {
    pub r: f64,
    pub g: f64,
    pub b: f64,
}

#[wasm_bindgen]
impl RGB {
    /// Creates a new RGB struct from floating point RGB values.
    ///
    /// # Example:
    ///
    /// ```
    /// use colorlib::rgb::RGB;
    ///
    /// let red = RGB::new(255.0, 0.0, 0.0);
    /// ```
    pub fn new(r: f64, g: f64, b: f64) -> RGB {
        let r = util::minmax(r, 0.0, 255.0);
        let g = util::minmax(g, 0.0, 255.0);
        let b = util::minmax(b, 0.0, 255.0);
        RGB { r, g, b }
    }

    /// Creates a new RGB struct from a hex code string.
    ///
    /// # Example:
    ///
    /// ```
    /// use colorlib::rgb::RGB;
    ///
    /// let red = RGB::from_hex("FF0000");
    /// ```
    pub fn from_hex(code: &str) -> RGB {
        let hex = Hex::from_code(&code);
        let (r, g, b) = (hex.r as f64, hex.g as f64, hex.b as f64);
        RGB::new(r, g, b)
    }

    /// Creates a new RGB struct from floating point HSV values.
    ///
    /// # Example:
    ///
    /// ```
    /// use colorlib::rgb::RGB;
    ///
    /// let red = RGB::from_hsv(0.0, 1.0, 1.0);
    /// ```
    pub fn from_hsv(h: f64, s: f64, v: f64) -> RGB {
        // Calculate constants
        let c = v * s;
        let x = c * calc::h_prime(h);
        let m = v - c;

        // Calculate RGB
        let [r, g, b] = calc::rgb_prime(h, c, x).map(|n| 255.0 * (n + m));

        return RGB::new(r, g, b);
    }

    /// Creates a new RGB struct from floating point HCL values.
    ///
    /// # Example:
    ///
    /// ```
    /// use colorlib::rgb::RGB;
    ///
    /// let red = RGB::from_hcl(0.0, 1.0, 0.55);
    /// ```
    pub fn from_hcl(h: f64, c: f64, l: f64) -> RGB {
        let hsv = HSV::from_hcl(h, c, l);
        RGB::from_hsv(hsv.h, hsv.s, hsv.v)
    }

    /// Checks if two RGB colors are equal
    ///
    /// # Example:
    ///
    /// ```
    /// use colorlib::rgb::RGB;
    ///
    /// let rgb1 = RGB::new(255.0, 0.0, 0.0);
    /// let rgb2 = RGB::new(255.0, 0.0, 0.0);
    /// assert!(rgb1.equals(&rgb2));
    /// ```
    pub fn equals(&self, other: &RGB) -> bool {
        self == other
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::color::util::assert_close;

    mod struct_tests {
        use super::*;

        #[test]
        fn create_new() {
            let rgb = RGB::new(0.0, 1.0, 2.0);
            assert_eq!(rgb.r, 0.0);
            assert_eq!(rgb.g, 1.0);
            assert_eq!(rgb.b, 2.0);
        }

        #[test]
        fn enforce_min() {
            let rgb = RGB::new(-1.0, -1.0, -1.0);
            assert_eq!(rgb.r, 0.0);
            assert_eq!(rgb.g, 0.0);
            assert_eq!(rgb.b, 0.0);
        }

        #[test]
        fn enforce_max() {
            let rgb = RGB::new(1000.0, 1000.0, 1000.0);
            assert_eq!(rgb.r, 255.0);
            assert_eq!(rgb.g, 255.0);
            assert_eq!(rgb.b, 255.0);
        }
    }

    mod conversion_tests {
        use super::*;

        macro_rules! from_hsv {
            ($name:ident, $h:expr, $s:expr, $v:expr, $r:expr, $g:expr, $b:expr) => {
                #[test]
                fn $name() {
                    let rgb = RGB::from_hsv($h, $s, $v);
                    assert_close(rgb.r, $r);
                    assert_close(rgb.g, $g);
                    assert_close(rgb.b, $b);

                    let hsv = HSV::from_rgb(rgb.r, rgb.g, rgb.b);
                    assert_close(hsv.h, $h);
                    assert_close(hsv.s, $s);
                    assert_close(hsv.v, $v);
                }
            };
        }

        from_hsv!(from_hsv_black, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0);
        from_hsv!(from_hsv_grey, 0.0, 0.0, 0.498039, 127.0, 127.0, 127.0);
        from_hsv!(from_hsv_white, 0.0, 0.0, 1.0, 255.0, 255.0, 255.0);
        from_hsv!(from_hsv_red, 0.0, 0.9, 1.0, 255.0, 25.5, 25.5);
        from_hsv!(from_hsv_yellow, 60.0, 0.9, 1.0, 255.0, 255.0, 25.5);
        from_hsv!(from_hsv_green, 120.0, 0.9, 1.0, 25.5, 255.0, 25.5);
        from_hsv!(from_hsv_cyan, 180.0, 0.9, 1.0, 25.5, 255.0, 255.0);
        from_hsv!(from_hsv_blue, 240.0, 0.9, 1.0, 25.5, 25.5, 255.0);
        from_hsv!(from_hsv_magenta, 300.0, 0.9, 1.0, 255.0, 25.5, 255.0);

        #[test]
        fn from_hsv_red_360() {
            let rgb = RGB::from_hsv(360.0, 0.9, 1.0);
            assert_close(rgb.r, 255.0);
            assert_close(rgb.g, 25.5);
            assert_close(rgb.b, 25.5);

            let hsv = HSV::from_rgb(rgb.r, rgb.g, rgb.b);
            assert_close(hsv.h, 0.0);
            assert_close(hsv.s, 0.9);
            assert_close(hsv.v, 1.0);
        }
    }
}
