//! Calculation Functions

/// Perceptual Brightness Correction Factor - Red
const C_R: f64 = 0.299;
///
/// Perceptual Brightness Correction Factor - Green
const C_G: f64 = 0.587;
///
/// Perceptual Brightness Correction Factor - Blue
const C_B: f64 = 0.114;

/// Calculates the Luminance of an HSV color
pub fn luminance_from_hsv(h: f64, s: f64, v: f64) -> f64 {
    let [a, b, c] = luminance_constants(h);
    let h_prime = h_prime(h);
    let v_squared = v.powi(2);

    return (a * v_squared
        + b * v_squared * (s * (h_prime - 1.0) + 1.0).powi(2)
        + c * v_squared * (1.0 - s).powi(2))
    .sqrt();
}

/// Calculates the Value of an HSV color from its Luminance
pub fn value(h: f64, s: f64, l: f64) -> f64 {
    let l_boundary = luminance_from_hsv(h, s, 1.0);
    l / l_boundary
}

/// Calculates the Chroma of an HSV color from its Luminance
pub fn chroma(h: f64, s: f64, l: f64) -> f64 {
    let cutoff = luminance_cutoff(h);
    if l <= cutoff {
        s
    } else {
        let boundary = chroma_boundary(h, l);
        if boundary.abs() < 1e-10 {
            0.0
        } else {
            s / boundary
        }
    }
}

/// Calculates the Saturation of an HCL color
pub fn saturation(h: f64, c: f64, l: f64) -> f64 {
    let cutoff = luminance_cutoff(h);
    if l <= cutoff {
        c
    } else {
        let boundary = chroma_boundary(h, l);
        c * boundary
    }
}

/// Calculates the highest Luminance value for a given Hue
pub fn luminance_cutoff(h: f64) -> f64 {
    luminance_from_hsv(h, 1.0, 1.0)
}

/// Calculates the Chroma boundary of an HCL color
pub fn chroma_boundary(h: f64, l: f64) -> f64 {
    let [a, b, c] = luminance_constants(h);
    let h_prime = h_prime(h);

    let hm1_2 = (h_prime - 1.0).powi(2);
    let l_2 = l.powi(2);
    let h_2 = h_prime.powi(2);

    let t1 = -h_prime * b + b + c;
    let t2 = c * l_2;
    let t3 = -a * (b * hm1_2 + c);
    let t4 = b * (hm1_2 * l_2 - c * h_2);
    let t5 = b * hm1_2 + c;

    let radicand = t2 + t3 + t4;

    if radicand.abs() < 1e-10 {
        t1 / t5
    } else {
        (t1 - radicand.sqrt()) / t5
    }
}

/// Calculates H' for a given Hue
pub fn h_prime(h: f64) -> f64 {
    1.0 - (((h / 60.0) % 2.0) - 1.0).abs()
}

/// Calculates the domain for a given Hue
pub fn h_domain(h: f64) -> u8 {
    ((h / 60.0) % 6.0) as u8
}

/// Calculates RGB'
pub fn rgb_prime(h: f64, c: f64, x: f64) -> [f64; 3] {
    match h_domain(h) {
        0 => [c, x, 0.0],
        1 => [x, c, 0.0],
        2 => [0.0, c, x],
        3 => [0.0, x, c],
        4 => [x, 0.0, c],
        5 => [c, 0.0, x],
        _ => [c, x, 0.0],
    }
}

/// Calculates the Luminance constants for a given Hue
pub fn luminance_constants(h: f64) -> [f64; 3] {
    let (r, g, b) = (C_R, C_G, C_B);

    match h_domain(h) {
        0 => [r, g, b],
        1 => [g, r, b],
        2 => [g, b, r],
        3 => [b, g, r],
        4 => [b, r, g],
        5 => [r, b, g],
        _ => [r, g, b],
    }
}

#[cfg(test)]
mod tests {
    use crate::color::calc;
    use crate::color::util::assert_close;

    mod luminance {
        use super::*;

        macro_rules! calculate_hsv {
            ($name:ident, $h:expr, $s:expr, $v:expr, $l:expr) => {
                #[test]
                fn $name() {
                    let lum = calc::luminance_from_hsv($h, $s, $v);
                    assert_close(lum, $l);
                }
            };
        }

        calculate_hsv!(calculate_hsv_black, 0.0, 0.0, 0.0, 0.0);
        calculate_hsv!(calculate_hsv_grey, 0.0, 0.0, 0.498039, 0.498039);
        calculate_hsv!(calculate_hsv_white, 0.0, 0.0, 1.0, 1.0);
        calculate_hsv!(calculate_hsv_red, 0.0, 0.9, 1.0, 0.553182);
        calculate_hsv!(calculate_hsv_yellow, 60.0, 0.9, 1.0, 0.941881);
        calculate_hsv!(calculate_hsv_green, 120.0, 0.9, 1.0, 0.76885);
        calculate_hsv!(calculate_hsv_cyan, 180.0, 0.9, 1.0, 0.839041);
        calculate_hsv!(calculate_hsv_blue, 240.0, 0.9, 1.0, 0.350514);
        calculate_hsv!(calculate_hsv_magenta, 300.0, 0.9, 1.0, 0.647202);
        calculate_hsv!(calculate_hsv_red_360, 360.0, 0.9, 1.0, 0.553182);
    }

    mod luminance_cutoff {
        use super::*;

        macro_rules! calculate {
            ($name:ident, $h:expr, $expected:expr) => {
                #[test]
                fn $name() {
                    let l_0 = calc::luminance_cutoff($h);
                    assert_close(l_0, $expected)
                }
            };
        }

        calculate!(calculate_red, 0.0, 0.546809);
        calculate!(calculate_yellow, 60.0, 0.941276);
        calculate!(calculate_green, 120.0, 0.766159);
        calculate!(calculate_cyan, 180.0, 0.837259);
        calculate!(calculate_blue, 240.0, 0.337639);
        calculate!(calculate_magenta, 300.0, 0.642651);
    }

    mod chroma_boundary {
        use super::*;

        macro_rules! at_cutoff {
            ($name:ident, $h:expr, $expected:expr) => {
                #[test]
                fn $name() {
                    let l = calc::luminance_cutoff($h);
                    let c = calc::chroma_boundary($h, l);
                    assert_close(c, $expected)
                }
            };
        }

        macro_rules! at_midpoint {
            ($name:ident, $h:expr, $expected:expr) => {
                #[test]
                fn $name() {
                    let l = 1.0 - (1.0 - calc::luminance_cutoff($h)) / 2.0;
                    let c = calc::chroma_boundary($h, l);
                    assert_close(c, $expected)
                }
            };
        }

        macro_rules! at_upper {
            ($name:ident, $h:expr, $expected:expr) => {
                #[test]
                fn $name() {
                    let c = calc::chroma_boundary($h, 1.0);
                    assert_close(c, $expected)
                }
            };
        }

        at_cutoff!(at_cutoff_red, 0.0, 1.0);
        at_cutoff!(at_cutoff_yellow, 60.0, 1.0);
        at_cutoff!(at_cutoff_green, 120.0, 1.0);
        at_cutoff!(at_cutoff_cyan, 180.0, 1.0);
        at_cutoff!(at_cutoff_blue, 240.0, 1.0);
        at_cutoff!(at_cutoff_magenta, 300.0, 1.0);

        at_midpoint!(at_midpoint_red, 0.0, 0.346737);
        at_midpoint!(at_midpoint_yellow, 60.0, 0.298272);
        at_midpoint!(at_midpoint_green, 120.0, 0.316701);
        at_midpoint!(at_midpoint_cyan, 180.0, 0.308732);
        at_midpoint!(at_midpoint_blue, 240.0, 0.386643);
        at_midpoint!(at_midpoint_magenta, 300.0, 0.332458);

        at_upper!(at_upper_red, 0.0, 0.0);
        at_upper!(at_upper_yellow, 60.0, 0.0);
        at_upper!(at_upper_green, 120.0, 0.0);
        at_upper!(at_upper_cyan, 180.0, 0.0);
        at_upper!(at_upper_blue, 240.0, 0.0);
        at_upper!(at_upper_magenta, 300.0, 0.0);
    }

    mod chroma {
        use super::*;

        #[test]
        fn red_below_cutoff() {
            let c = calc::chroma(0.0, 0.5, 0.1);
            assert_eq!(c, 0.5);
        }

        macro_rules! at_cutoff {
            ($name:ident, $s:expr, $h:expr, $expected:expr) => {
                #[test]
                fn $name() {
                    let l = calc::luminance_cutoff($h);
                    let c = calc::chroma($h, $s, l);
                    assert_close(c, $expected)
                }
            };
        }

        macro_rules! at_midpoint {
            ($name:ident, $s:expr, $h:expr, $expected:expr) => {
                #[test]
                fn $name() {
                    let l = 1.0 - (1.0 - calc::luminance_cutoff($h)) / 2.0;
                    let c = calc::chroma($h, $s, l);
                    assert_close(c, $expected)
                }
            };
        }

        macro_rules! at_upper {
            ($name:ident, $h:expr, $expected:expr) => {
                #[test]
                fn $name() {
                    let c = calc::chroma($h, 0.0, 1.0);
                    assert_close(c, $expected)
                }
            };
        }

        at_cutoff!(at_cutoff_red_1, 0.0, 0.0, 0.0);
        at_cutoff!(at_cutoff_red_2, 0.5, 0.0, 0.5);
        at_cutoff!(at_cutoff_red_3, 1.0, 0.0, 1.0);

        at_midpoint!(at_midpoint_red_1, 0.0, 0.0, 0.0);
        at_midpoint!(at_midpoint_red_2, 0.1733685, 0.0, 0.5);
        at_midpoint!(at_midpoint_red_3, 0.346737, 0.0, 1.0);

        at_upper!(at_upper_red, 0.0, 0.0);
        at_upper!(at_upper_yellow, 60.0, 0.0);
        at_upper!(at_upper_green, 120.0, 0.0);
        at_upper!(at_upper_cyan, 180.0, 0.0);
        at_upper!(at_upper_blue, 240.0, 0.0);
        at_upper!(at_upper_magenta, 300.0, 0.0);
    }

    mod value {
        use super::*;

        macro_rules! calculate {
            ($name:ident, $h:expr, $s:expr, $v:expr, $l:expr) => {
                #[test]
                fn $name() {
                    let val = calc::value($h, $s, $l);
                    assert_close(val, $v)
                }
            };
        }

        calculate!(calculate_black, 0.0, 0.0, 0.0, 0.0);
        calculate!(calculate_grey, 0.0, 0.0, 0.498039, 0.498039);
        calculate!(calculate_white, 0.0, 0.0, 1.0, 1.0);
        calculate!(calculate_red, 0.0, 0.9, 1.0, 0.553182);
        calculate!(calculate_yellow, 60.0, 0.9, 1.0, 0.941881);
        calculate!(calculate_green, 120.0, 0.9, 1.0, 0.76885);
        calculate!(calculate_cyan, 180.0, 0.9, 1.0, 0.839041);
        calculate!(calculate_blue, 240.0, 0.9, 1.0, 0.350514);
        calculate!(calculate_magenta, 300.0, 0.9, 1.0, 0.647202);
        calculate!(calculate_red_360, 360.0, 0.9, 1.0, 0.553182);
    }

    mod saturation {
        use super::*;

        #[test]
        fn red_below_cutoff() {
            let s = calc::saturation(0.0, 0.5, 0.1);
            assert_eq!(s, 0.5);
        }

        macro_rules! at_cutoff {
            ($name:ident, $c:expr, $h:expr, $expected:expr) => {
                #[test]
                fn $name() {
                    let l = calc::luminance_cutoff($h);
                    let s = calc::saturation($h, $c, l);
                    assert_close(s, $expected)
                }
            };
        }

        macro_rules! at_midpoint {
            ($name:ident, $c:expr, $h:expr, $expected:expr) => {
                #[test]
                fn $name() {
                    let l = 1.0 - (1.0 - calc::luminance_cutoff($h)) / 2.0;
                    let s = calc::saturation($h, $c, l);
                    assert_close(s, $expected)
                }
            };
        }

        macro_rules! at_upper {
            ($name:ident, $c:expr, $h:expr, $expected:expr) => {
                #[test]
                fn $name() {
                    let l = 1.0;
                    let s = calc::saturation($h, $c, l);
                    assert_close(s, $expected)
                }
            };
        }

        at_cutoff!(at_cutoff_1, 0.0, 0.0, 0.0);
        at_cutoff!(at_cutoff_2, 0.5, 0.0, 0.5);
        at_cutoff!(at_cutoff_3, 1.0, 0.0, 1.0);

        at_midpoint!(at_midpoint_1, 0.0, 0.0, 0.0);
        at_midpoint!(at_midpoint_2, 0.5, 0.0, 0.173367);
        at_midpoint!(at_midpoint_3, 1.0, 0.0, 0.346735);

        at_upper!(at_upper_1, 0.0, 0.0, 0.0);
        at_upper!(at_upper_2, 0.5, 0.0, 0.0);
        at_upper!(at_upper_3, 1.0, 0.0, 0.0);
    }
}
