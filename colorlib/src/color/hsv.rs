use crate::color::calc;
use crate::color::rgb::RGB;
use crate::color::util;
use wasm_bindgen::prelude::*;

/// Represents a color in HSV space
///
/// Holds three color components:
/// - H: Hue
/// - S: Saturation
/// - V: Value
///
/// # Example:
///
/// ```
/// use color::hsv::HSV;
///
/// let red = HSV::new(0.0, 1.0, 1.0);
/// ```
#[wasm_bindgen]
#[derive(Clone, Copy, Debug, PartialEq)]
pub struct HSV {
    pub h: f64,
    pub s: f64,
    pub v: f64,
}

#[wasm_bindgen]
impl HSV {
    /// Creates a new HSV struct from floating point HSV values.
    ///
    /// # Example:
    ///
    /// ```
    /// use color::hsv::HSV;
    ///
    /// let red = HSV::new(0.0, 1.0, 1.0);
    /// ```
    pub fn new(h: f64, s: f64, v: f64) -> HSV {
        let h = util::minmax(util::map_degrees(h), 0.0, 360.0);
        let s = util::minmax(s, 0.0, 1.0);
        let v = util::minmax(v, 0.0, 1.0);
        HSV { h, s, v }
    }

    /// Creates a new HSV struct from a hex code string.
    ///
    /// # Example:
    ///
    /// ```
    /// use color::hsv::HSV;
    ///
    /// let red = HSV::from_hex("FF0000");
    /// ```
    pub fn from_hex(code: &str) -> HSV {
        let rgb = RGB::from_hex(&code);
        HSV::from_rgb(rgb.r, rgb.g, rgb.b)
    }

    /// Creates a new HSV struct from floating point RGB values.
    ///
    /// # Example:
    ///
    /// ```
    /// use color::hsv::HSV;
    ///
    /// let red = HSV::from_rgb(255.0, 0.0, 0.0);
    /// ```
    pub fn from_rgb(r: f64, g: f64, b: f64) -> HSV {
        // Calculate constants
        let r_prime = r / 255.0;
        let g_prime = g / 255.0;
        let b_prime = b / 255.0;

        let c_max = r_prime.max(g_prime).max(b_prime);
        let c_min = r_prime.min(g_prime).min(b_prime);
        let delta = c_max - c_min;

        // Calculate H
        let h = if delta == 0.0 {
            0.0
        } else {
            if c_max == r_prime {
                60.0 * (((g_prime - b_prime) / delta) % 6.0)
            } else if c_max == g_prime {
                60.0 * ((b_prime - r_prime) / delta + 2.0)
            } else if c_max == b_prime {
                60.0 * ((r_prime - g_prime) / delta + 4.0)
            } else {
                0.0
            }
        };

        // Calculate S
        let s = if c_max == 0.0 { 0.0 } else { delta / c_max };

        // Calculate V
        let v = c_max;

        HSV::new(h, s, v)
    }

    /// Creates a new HSV struct from floating point HCL values.
    ///
    /// # Example:
    ///
    /// ```
    /// use color::hsv::HSV;
    ///
    /// let red = HSV::from_hcl(0.0, 1.0, 0.55);
    /// ```
    pub fn from_hcl(h: f64, c: f64, l: f64) -> HSV {
        let s = calc::saturation(h, c, l);
        let v = calc::value(h, s, l);
        HSV::new(h, s, v)
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
            let hsv = HSV::new(0.0, 0.5, 1.0);
            assert_eq!(hsv.h, 0.0);
            assert_eq!(hsv.s, 0.5);
            assert_eq!(hsv.v, 1.0);
        }

        #[test]
        fn enforce_min() {
            let hsv = HSV::new(-60.0, -1.0, -1.0);
            assert_eq!(hsv.h, 300.0);
            assert_eq!(hsv.s, 0.0);
            assert_eq!(hsv.v, 0.0);
        }

        #[test]
        fn enforce_max() {
            let hsv = HSV::new(1000.0, 1000.0, 1000.0);
            assert_eq!(hsv.h, 280.0);
            assert_eq!(hsv.s, 1.0);
            assert_eq!(hsv.v, 1.0);
        }
    }

    mod conversion_tests {
        use super::*;

        macro_rules! from_rgb {
            ($name:ident, $r:expr, $g:expr, $b:expr, $h:expr, $s:expr, $v:expr) => {
                #[test]
                fn $name() {
                    let hsv = HSV::from_rgb($r, $g, $b);
                    assert_close(hsv.h, $h);
                    assert_close(hsv.s, $s);
                    assert_close(hsv.v, $v);

                    let rgb = RGB::from_hsv(hsv.h, hsv.s, hsv.v);
                    assert_close(rgb.r, $r);
                    assert_close(rgb.g, $g);
                    assert_close(rgb.b, $b);
                }
            };
        }

        from_rgb!(from_rgb_black, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0);
        from_rgb!(from_rgb_grey, 127.0, 127.0, 127.0, 0.0, 0.0, 0.498039);
        from_rgb!(from_rgb_white, 255.0, 255.0, 255.0, 0.0, 0.0, 1.0);
        from_rgb!(from_rgb_red, 255.0, 127.0, 127.0, 0.0, 0.501961, 1.0);
        from_rgb!(from_rgb_green, 127.0, 255.0, 127.0, 120.0, 0.501961, 1.0);
        from_rgb!(from_rgb_blue, 127.0, 127.0, 255.0, 240.0, 0.501961, 1.0);
    }
}
