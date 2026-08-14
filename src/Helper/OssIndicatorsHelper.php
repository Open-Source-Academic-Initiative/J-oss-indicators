<?php
/**
 * @package    mod_oss_indicators
 * @copyright  Copyright (C) 2026 Open Source Academic Initiative (OpenSAI).
 * @license    GNU General Public License version 3 or later; see LICENSE
 */

namespace OpenSAI\OssIndicators\Site\Helper;

\defined('_JEXEC') or die;

use Joomla\Registry\Registry;

/**
 * Turns the module params into a plain config array for the layout + client JS.
 */
class OssIndicatorsHelper
{
    /**
     * @param   Registry  $params  Module params.
     * @param   object    $module  The module row (needs ->id).
     *
     * @return  array
     */
    public static function buildConfig(Registry $params, object $module): array
    {
        // Optional admin override of the indicator set (JSON array). Empty => JS defaults.
        $indicators = null;
        $raw        = trim((string) $params->get('indicators', ''));

        if ($raw !== '') {
            $decoded = json_decode($raw, true);

            if (\is_array($decoded)) {
                $indicators = $decoded;
            }
        }

        return [
            'id'            => (int) $module->id,
            'title'         => (string) $params->get('title', 'Ecosistema Global Open Source'),
            'loadingText'   => (string) $params->get('loading_text', 'Sincronizando pulso global...'),
            'noDataText'    => (string) $params->get('nodata_text', 'No hay datos disponibles'),
            'tooltipTitle'  => (string) $params->get('tooltip_title', '¿Por qué importa?'),
            'scrollSeconds' => max(10, (int) $params->get('scroll_seconds', 130)),
            'fetchCount'    => max(1, (int) $params->get('fetch_count', 10)),
            'showCount'     => max(1, (int) $params->get('show_count', 7)),
            'cacheHours'    => max(1, (float) $params->get('cache_hours', 24)),
            'colors'        => [
                'bg'      => (string) $params->get('color_bg', ''),
                'text'    => (string) $params->get('color_text', ''),
                'label'   => (string) $params->get('color_label', ''),
                'border'  => (string) $params->get('color_border', ''),
                'green'   => (string) $params->get('color_green', ''),
                'red'     => (string) $params->get('color_red', ''),
                'blue'    => (string) $params->get('color_blue', ''),
                'tooltip' => (string) $params->get('color_tooltip', ''),
            ],
            'indicators'    => $indicators,
        ];
    }
}
