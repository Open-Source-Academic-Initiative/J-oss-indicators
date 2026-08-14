<?php
/**
 * @package    mod_oss_indicators
 * @copyright  Copyright (C) 2026 Open Source Academic Initiative (OpenSAI).
 * @license    GNU General Public License version 3 or later; see LICENSE
 *
 * @var  array  $config  Built by OssIndicatorsHelper::buildConfig().
 */

\defined('_JEXEC') or die;

use Joomla\CMS\HTML\HTMLHelper;

$id     = (int) $config['id'];
$rootId = 'ossi-' . $id;

// Map any color overrides -> CSS custom properties on the root (validated as hex).
$varMap = [
    'bg' => '--ticker-bg', 'text' => '--ticker-text', 'label' => '--ticker-label',
    'border' => '--ticker-border', 'green' => '--ticker-green', 'red' => '--ticker-red',
    'blue' => '--ticker-blue', 'tooltip' => '--tooltip-bg',
];
$style = '--ossi-scroll:' . (int) $config['scrollSeconds'] . 's;';

foreach ($varMap as $key => $cssVar) {
    $color = (string) ($config['colors'][$key] ?? '');

    if ($color !== '' && preg_match('/^#[0-9A-Fa-f]{3,8}$/', $color)) {
        $style .= $cssVar . ':' . $color . ';';
    }
}

// Per-instance config handed to the client script.
$jsCfg = [
    'cacheKey'     => 'ossi_' . $id . '_v1',
    'cacheHours'   => $config['cacheHours'],
    'fetchCount'   => $config['fetchCount'],
    'showCount'    => $config['showCount'],
    'tooltipTitle' => $config['tooltipTitle'],
    'noDataText'   => $config['noDataText'],
    'indicators'   => $config['indicators'], // null => JS uses its built-in defaults
];

HTMLHelper::_('stylesheet', 'mod_oss_indicators/css/ticker.css', ['relative' => true, 'version' => 'auto']);
HTMLHelper::_('script', 'mod_oss_indicators/js/ticker.js', ['relative' => true, 'version' => 'auto'], ['defer' => true]);
?>
<div class="oss-ticker-root" id="<?php echo $rootId; ?>" data-ossi="<?php echo $id; ?>" style="<?php echo $style; ?>">
    <div class="oss-ticker-title"><?php echo htmlspecialchars($config['title'], ENT_QUOTES, 'UTF-8'); ?></div>
    <div class="oss-ticker-container">
        <div class="oss-ticker-loading"><?php echo htmlspecialchars($config['loadingText'], ENT_QUOTES, 'UTF-8'); ?></div>
        <div class="oss-ticker-wrapper" style="display:none;">&nbsp;</div>
    </div>
</div>
<script>
window.OSSI = window.OSSI || {};
window.OSSI[<?php echo $id; ?>] = <?php echo json_encode($jsCfg, JSON_UNESCAPED_UNICODE | JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT); ?>;
</script>
