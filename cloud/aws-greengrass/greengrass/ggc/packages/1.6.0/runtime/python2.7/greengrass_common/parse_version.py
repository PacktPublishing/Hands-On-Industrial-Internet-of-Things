#
# Copyright 2010-2018 Amazon.com, Inc. or its affiliates. All Rights Reserved.
#

import re


def parse_version(version):
    version_regex = r'^(?P<major>\d+)\.(?P<minor>\d+)'
    version_match = re.search(version_regex, version)
    major = int(version_match.group('major'))
    minor = int(version_match.group('minor'))
    return major, minor
