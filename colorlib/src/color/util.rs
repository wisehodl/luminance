//! Utility Functions

/// Converts a short Hex code (XXX) to a regular Hex code (XXXXXX)
pub fn convert_short_code(short_code: &String) -> String {
    short_code
        .chars()
        .flat_map(|c| std::iter::repeat(c).take(2))
        .collect()
}

/// Enforces minimum and maximum values on a number
pub fn minmax(number: f64, min: f64, max: f64) -> f64 {
    number.max(min).min(max)
}

/// Maps a value in Degrees to the [0, 360) domain.
pub fn map_degrees(degrees: f64) -> f64 {
    degrees - 360.0 * (degrees / 360.0).floor()
}

/// Asserts two values are approximately equal
#[cfg(test)]
pub fn assert_close(value: f64, expected: f64) {
    let diff = (value - expected).abs();
    assert!(diff < 1e-4);
}
