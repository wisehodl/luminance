use crate::color::rgb::RGB;
use crate::color::util;
use hex;
use wasm_bindgen::prelude::*;

/// Represents a hexadecimal color in RGB space
///
/// Holds three color components in 8-bit integer form.
/// - R: Red
/// - G: Green
/// - B: Blue
///
/// # Example:
///
/// ```
/// use colorlib::hex::Hex;
///
/// let red = Hex::new(255.0, 0.0, 0.0);
/// ```
#[wasm_bindgen]
#[derive(Clone, Copy, Debug, PartialEq)]
pub struct Hex {
    pub r: u8,
    pub g: u8,
    pub b: u8,
}

#[wasm_bindgen]
impl Hex {
    /// Creates a new Hex struct from floating point RGB values.
    ///
    /// # Example:
    ///
    /// ```
    /// use colorlib::hex::Hex;
    ///
    /// let red = Hex::new(255.0, 0.0, 0.0);
    /// ```
    pub fn new(r: f64, g: f64, b: f64) -> Hex {
        let (r, g, b) = (r as u8, g as u8, b as u8);
        Hex { r, g, b }
    }

    /// Creates a new Hex struct from integer RGB values
    ///
    /// # Example:
    ///
    /// ```
    /// use colorlib::hex::Hex;
    ///
    /// let red = Hex::new_int(255, 0, 0);
    /// ```
    pub fn new_int(r: u8, g: u8, b: u8) -> Hex {
        Hex { r, g, b }
    }

    /// Creates a new Hex struct from RGB values.
    ///
    /// # Example:
    ///
    /// ```
    /// use colorlib::hex::Hex;
    ///
    /// let red = Hex::from_rgb(255.0, 0.0, 0.0);
    /// ```
    pub fn from_rgb(r: f64, g: f64, b: f64) -> Hex {
        Hex::new(r, g, b)
    }

    /// Creates a new Hex struct from HSV values.
    ///
    /// # Example:
    ///
    /// ```
    /// use colorlib::hex::Hex;
    ///
    /// let red = Hex::from_hsv(0.0, 1.0, 1.0);
    /// ```
    pub fn from_hsv(h: f64, s: f64, v: f64) -> Hex {
        let rgb = RGB::from_hsv(h, s, v);
        Hex::new(rgb.r, rgb.g, rgb.b)
    }

    /// Creates a new Hex struct from HCL values.
    ///
    /// # Example:
    ///
    /// ```
    /// use colorlib::hex::Hex;
    ///
    /// let red = Hex::from_hcl(0.0, 1.0, 0.55);
    /// ```
    pub fn from_hcl(h: f64, c: f64, l: f64) -> Hex {
        let rgb = RGB::from_hcl(h, c, l);
        Hex::new(rgb.r, rgb.g, rgb.b)
    }

    /// Converts the Hex color to a hex code string.
    ///
    /// # Example:
    ///
    /// ```
    /// use colorlib::hex::Hex;
    ///
    /// let red = Hex::new_int(255, 0, 0);
    /// assert_eq!(red.to_code(), String::from("FF0000"));
    /// ```
    pub fn to_code(&self) -> String {
        hex::encode_upper([self.r, self.g, self.b])
    }

    /// Creates a new Hex struct from a hex code string.
    ///
    /// # Example:
    ///
    /// ```
    /// use colorlib::hex::Hex;
    ///
    /// let red = Hex::from_code("FF0000");
    /// let green = Hex::from_code("0F0");
    /// ```
    pub fn from_code(code: &str) -> Hex {
        let code = code.to_string();
        let code = if code.len() == 3 {
            util::convert_short_code(&code)
        } else {
            code.clone()
        };

        let decoded = match hex::decode(code) {
            Ok(decoded) => decoded,
            Err(_) => vec![0, 0, 0],
        };

        Hex {
            r: decoded[0],
            g: decoded[1],
            b: decoded[2],
        }
    }

    /// Checks if two Hex colors are equal
    ///
    /// # Example:
    ///
    /// ```
    /// use colorlib::hex::Hex;
    ///
    /// let hex1 = Hex::from_code("FF0000");
    /// let hex2 = Hex::from_code("FF0000");
    /// assert!(hex1.equals(&hex2));
    /// ```
    pub fn equals(&self, other: &Hex) -> bool {
        self == other
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    mod struct_tests {
        use super::*;

        #[test]
        fn create_new() {
            let hex = Hex::new(0.0, 1.0, 2.0);
            assert_eq!(hex.r, 0);
            assert_eq!(hex.g, 1);
            assert_eq!(hex.b, 2);
        }

        #[test]
        fn enforce_min() {
            let hex = Hex::new(-1.0, -1.0, -1.0);
            assert_eq!(hex.r, 0);
            assert_eq!(hex.g, 0);
            assert_eq!(hex.b, 0);
        }

        #[test]
        fn enforce_max() {
            let hex = Hex::new(1000.0, 1000.0, 1000.0);
            assert_eq!(hex.r, 255);
            assert_eq!(hex.g, 255);
            assert_eq!(hex.b, 255);
        }

        #[test]
        fn to_code() {
            let hex = Hex::new(255.0, 0.0, 0.0);
            let hex_code = hex.to_code();
            assert_eq!(hex_code, "FF0000")
        }
    }

    mod conversion_tests {
        use super::*;

        macro_rules! to_code {
            ($name:ident, $r:expr, $g:expr, $b:expr, $code:expr) => {
                #[test]
                fn $name() {
                    let hex = Hex::new_int($r, $g, $b);
                    let code = hex.to_code();
                    assert_eq!(code, $code);
                }
            };
        }

        to_code!(to_code_black, 0, 0, 0, "000000");
        to_code!(to_code_red, 255, 0, 0, "FF0000");
        to_code!(to_code_grey, 127, 127, 127, "7F7F7F");
        to_code!(to_code_white, 255, 255, 255, "FFFFFF");

        macro_rules! from_code {
            ($name:ident, $code:expr, $r:expr, $g:expr, $b:expr, $reverse:expr) => {
                #[test]
                fn $name() {
                    let hex = Hex::from_code($code);
                    assert_eq!(hex.r, $r);
                    assert_eq!(hex.g, $g);
                    assert_eq!(hex.b, $b);

                    let hex = Hex::new_int($r, $g, $b);
                    let code = hex.to_code();
                    assert_eq!(code, $reverse);
                }
            };
        }

        from_code!(from_code_black, "000000", 0, 0, 0, "000000");
        from_code!(from_code_red, "FF0000", 255, 0, 0, "FF0000");
        from_code!(from_code_grey, "7F7F7F", 127, 127, 127, "7F7F7F");
        from_code!(from_code_shorthand_hex, "012", 0, 17, 34, "001122");
        from_code!(from_code_lowercase_hex, "7f7f7f", 127, 127, 127, "7F7F7F");

        #[test]
        fn from_short_code() {
            let hex = Hex::from_code("00F");
            assert_eq!(hex.r, 0);
            assert_eq!(hex.g, 0);
            assert_eq!(hex.b, 255);
        }

        #[test]
        fn from_code_bad_input() {
            let hex = Hex::from_code("xyz");
            assert_eq!(hex.r, 0);
            assert_eq!(hex.g, 0);
            assert_eq!(hex.b, 0);
        }
    }
}
