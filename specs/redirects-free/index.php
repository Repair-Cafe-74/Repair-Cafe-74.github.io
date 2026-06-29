<?php
/**
 * HACK : redirections vers le nouveau site
 */
$redirects = array(
    9   => 'https://www.repaircafe74.fr/',
    11  => 'https://www.repaircafe74.fr/agenda/',
    17  => 'https://www.repaircafe74.fr/faq/',
    19  => 'https://www.repaircafe74.fr/faq/',
    301 => 'https://www.repaircafe74.fr/ressources/',
    224 => 'https://www.repaircafe74.fr/photos/',
    21  => 'https://www.repaircafe74.fr/contact/',
    119 => 'https://www.repaircafe74.fr/association/',
    57  => 'https://www.repaircafe74.fr/association/'
);

if (isset($_GET['page_id'])) {

    $pageId = intval($_GET['page_id']);

    if (isset($redirects[$pageId])) {
        header('HTTP/1.1 301 Moved Permanently');
        header('Location: '.$redirects[$pageId]);
    } else {
        header('HTTP/1.1 301 Moved Permanently');
        header('Location: https://www.repaircafe74.fr/');
    }

    exit;
}

/* Et si ça passe à travers, on redirige quand même... */
header('HTTP/1.1 301 Moved Permanently');
header('Location: https://www.repaircafe74.fr/');
exit;


// Et on supprime le chargement de Wordpress
//define('WP_USE_THEMES', true);
//require('./wp-blog-header.php');
?>