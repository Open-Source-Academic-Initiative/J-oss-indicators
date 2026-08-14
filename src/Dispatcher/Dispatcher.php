<?php
/**
 * @package    mod_oss_indicators
 * @copyright  Copyright (C) 2026 Open Source Academic Initiative (OpenSAI).
 * @license    GNU General Public License version 3 or later; see LICENSE
 */

namespace OpenSAI\OssIndicators\Site\Dispatcher;

\defined('_JEXEC') or die;

use Joomla\CMS\Dispatcher\AbstractModuleDispatcher;
use OpenSAI\OssIndicators\Site\Helper\OssIndicatorsHelper;

/**
 * Dispatcher for mod_oss_indicators. Builds the view config from the module
 * params and hands it to tmpl/default.php.
 */
class Dispatcher extends AbstractModuleDispatcher
{
    protected function getLayoutData(): array
    {
        $data = parent::getLayoutData();

        $data['config'] = OssIndicatorsHelper::buildConfig($data['params'], $data['module']);

        return $data;
    }
}
