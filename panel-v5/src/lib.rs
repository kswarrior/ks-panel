pub fn scan_heavy_duty() -> String {
    "Scanning... Done.".to_string()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn it_works() {
        assert_eq!(scan_heavy_duty(), "Scanning... Done.");
    }
}
