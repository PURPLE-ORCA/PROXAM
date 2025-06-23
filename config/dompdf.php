<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Settings
    |--------------------------------------------------------------------------
    |
    | Set some default values. It is possible to add all defines that can be set
    | in dompdf_config.inc.php. You can also override the entire config file.
    |
    */
    'show_warnings' => false,   // Throw an Exception on warnings from dompdf

    'public_path' => null,  // Override the public path if needed

    /*
     * Dejavu Sans font is missing glyphs for converted entities, turn it off if you need to show € and £.
     */
    'convert_entities' => true,

    'options' => [
        /**
         * The location of the DOMPDF font directory
         */
        'font_dir' => storage_path('fonts'),

        /**
         * The location of the DOMPDF font cache directory
         */
        'font_cache' => storage_path('fonts'),

        'temp_dir' => sys_get_temp_dir(),

        'chroot' => realpath(base_path()),

        'allowed_protocols' => [
            'data://' => ['rules' => []],
            'file://' => ['rules' => []],
            'http://' => ['rules' => []],
            'https://' => ['rules' => []],
        ],

        'artifactPathValidation' => null,
        'log_output_file' => null,
        
        /**
         * Enable font subsetting - IMPORTANT for Arabic fonts
         */
        'enable_font_subsetting' => true,

        'pdf_backend' => 'CPDF',
        'default_media_type' => 'screen',
        'default_paper_size' => 'a4',
        'default_paper_orientation' => 'portrait',
        
        /**
         * Set default font to one that supports Arabic
         */
        'default_font' => 'amiri',

        'dpi' => 96,
        'enable_php' => false,
        'enable_javascript' => true,
        'enable_remote' => false,
        'allowed_remote_hosts' => null,
        'font_height_ratio' => 1.1,
        'enable_html5_parser' => true,
        
        /**
         * Enable Unicode support for Arabic text
         */
        'enable_unicode' => true,
    ],

    /**
     * Font configuration for DomPDF
     * Make sure all font files exist in storage/fonts/
     */
    'font_maps' => [
        'amiri' => [
            'normal' => 'Amiri-Regular.ttf',
            'bold' => 'Amiri-Bold.ttf',
            'italic' => 'Amiri-Italic.ttf',
            'bold_italic' => 'Amiri-BoldItalic.ttf',
        ],
        // Add DejaVu Sans as fallback
        'dejavu-sans' => [
            'normal' => 'DejaVuSans.ttf',
            'bold' => 'DejaVuSans-Bold.ttf',
            'italic' => 'DejaVuSans-Oblique.ttf',
            'bold_italic' => 'DejaVuSans-BoldOblique.ttf',
        ]
    ]
];  