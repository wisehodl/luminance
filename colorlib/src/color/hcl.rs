use crate::color::calc;
use crate::color::hsv::HSV;
use crate::color::util;
use wasm_bindgen::prelude::*;

/// Represents a color in HCL space.
///
/// Holds three color components:
/// - H: Hue
/// - C: Chroma
/// - L: Luminance
///
/// # Example:
///
/// ```
/// use colorlib::hcl::HCL;
///
/// let red = HCL::new(0.0, 1.0, 0.55);
/// ```
#[wasm_bindgen]
#[derive(Clone, Copy, Debug, PartialEq)]
pub struct HCL {
    pub h: f64,
    pub c: f64,
    pub l: f64,
}

#[wasm_bindgen]
impl HCL {
    /// Creates a new HCL struct from floating point HCL values.
    ///
    /// # Example:
    ///
    /// ```
    /// use colorlib::hcl::HCL;
    ///
    /// let red = HCL::new(0.0, 1.0, 0.55);
    /// ```
    pub fn new(h: f64, c: f64, l: f64) -> HCL {
        let h = util::minmax(util::map_degrees(h), 0.0, 360.0);
        let c = util::minmax(c, 0.0, 1.0);
        let l = util::minmax(l, 0.0, 1.0);
        HCL { h, c, l }
    }

    /// Creates a new HCL struct from a hex code string.
    ///
    /// # Example:
    ///
    /// ```
    /// use colorlib::hcl::HCL;
    ///
    /// let red = HCL::from_hex("FF0000");
    /// ```
    pub fn from_hex(code: &str) -> HCL {
        let hsv = HSV::from_hex(&code);
        HCL::from_hsv(hsv.h, hsv.s, hsv.v)
    }

    /// Creates a new HCL struct from floating point RGB values.
    ///
    /// # Example:
    ///
    /// ```
    /// use colorlib::hcl::HCL;
    ///
    /// let red = HCL::from_rgb(255.0, 0.0, 0.0);
    /// ```
    pub fn from_rgb(r: f64, g: f64, b: f64) -> HCL {
        let hsv = HSV::from_rgb(r, g, b);
        HCL::from_hsv(hsv.h, hsv.s, hsv.v)
    }

    /// Creates a new HCL struct from floating point HSV values.
    ///
    /// # Example:
    ///
    /// ```
    /// use colorlib::hcl::HCL;
    ///
    /// let red = HCL::from_hsv(0.0, 1.0, 0.55);
    /// ```
    pub fn from_hsv(h: f64, s: f64, v: f64) -> HCL {
        let l = calc::luminance_from_hsv(h, s, v);
        let c = calc::chroma(h, s, l);
        HCL::new(h, c, l)
    }

    /// Checks if two HCL colors are equal
    ///
    /// # Example:
    ///
    /// ```
    /// use colorlib::hcl::HCL;
    ///
    /// let hcl1 = HCL::new(0.0, 1.0, 0.55);
    /// let hcl2 = HCL::new(0.0, 1.0, 0.55);
    /// assert!(hcl1.equals(&hcl2));
    /// ```
    pub fn equals(&self, other: &HCL) -> bool {
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
            let hcl = HCL::new(0.0, 0.5, 1.0);
            assert_eq!(hcl.h, 0.0);
            assert_eq!(hcl.c, 0.5);
            assert_eq!(hcl.l, 1.0);
        }

        #[test]
        fn enforce_min() {
            let hcl = HCL::new(-60.0, -1.0, -1.0);
            assert_eq!(hcl.h, 300.0);
            assert_eq!(hcl.c, 0.0);
            assert_eq!(hcl.l, 0.0);
        }

        #[test]
        fn enforce_max() {
            let hcl = HCL::new(1000.0, 1000.0, 1000.0);
            assert_eq!(hcl.h, 280.0);
            assert_eq!(hcl.c, 1.0);
            assert_eq!(hcl.l, 1.0);
        }
    }

    mod conversion_tests {
        use super::*;

        macro_rules! from_hsv {
            ($name:ident, $h:expr, $s:expr, $v:expr, $h2:expr, $c:expr, $l:expr) => {
                #[test]
                fn $name() {
                    let hcl = HCL::from_hsv($h, $s, $v);
                    assert_eq!(hcl.h, $h2);
                    assert_close(hcl.c, $c);
                    assert_close(hcl.l, $l);

                    let hsv = HSV::from_hcl(hcl.h, hcl.c, hcl.l);
                    assert_eq!(hsv.h, $h);
                    assert_close(hsv.s, $s);
                    assert_close(hsv.v, $v);
                }
            };
        }

        from_hsv!(from_hsv_black, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0);
        from_hsv!(from_hsv_grey, 0.0, 0.0, 0.5, 0.0, 0.0, 0.5);
        from_hsv!(from_hsv_white, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0);
        from_hsv!(from_hsv_dark_red, 0.0, 0.9, 0.5, 0.0, 0.9, 0.276591);
        from_hsv!(from_hsv_light_red, 0.0, 0.5, 0.9, 0.0, 0.767469, 0.619792);
        from_hsv!(from_hsv_dark_yellow, 60.0, 0.9, 0.5, 60.0, 0.9, 0.470941);
        from_hsv!(
            from_hsv_light_yellow,
            60.0,
            0.5,
            0.99,
            60.0,
            0.714905,
            0.946732
        );
        from_hsv!(from_hsv_dark_green, 120.0, 0.9, 0.5, 120.0, 0.9, 0.384425);
        from_hsv!(
            from_hsv_light_green,
            120.0,
            0.5,
            0.95,
            120.0,
            0.709257,
            0.789272
        );
        from_hsv!(from_hsv_dark_cyan, 180.0, 0.9, 0.5, 180.0, 0.9, 0.419521);
        from_hsv!(
            from_hsv_light_cyan,
            180.0,
            0.5,
            0.99,
            180.0,
            0.901529,
            0.871959
        );
        from_hsv!(from_hsv_dark_blue, 240.0, 0.9, 0.5, 240.0, 0.9, 0.175257);
        from_hsv!(
            from_hsv_light_blue,
            240.0,
            0.5,
            0.9,
            240.0,
            0.864996,
            0.521301
        );
        from_hsv!(from_hsv_dark_magenta, 300.0, 0.9, 0.5, 300.0, 0.9, 0.323601);
        from_hsv!(
            from_hsv_light_magenta,
            300.0,
            0.5,
            0.9,
            300.0,
            0.677815,
            0.673348
        );
    }
}
